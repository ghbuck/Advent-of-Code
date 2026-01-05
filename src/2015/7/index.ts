import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

type Wire = string
type WireMap = Map<Wire, number | undefined>

interface Gate {
  operation: (value1: number, value2: number) => number
  inputs: (Wire | number)[]
  output: Wire
}

interface CircuitInfo {
  wires: WireMap
  gates: Gate[]
}

//===== Operation Functions =====//

const operations: Record<string, (value1: number, value2: number) => number> = {
  AND: (value1: number, value2: number) => value1 & value2,
  OR: (value1: number, value2: number) => value1 | value2,
  NOT: (_, value2: number) => ~value2 & 0xffff, // signed
  LSHIFT: (value1: number, value2: number) => value1 << value2,
  RSHIFT: (value1: number, value2: number) => value1 >> value2,
  DIRECT_ASSIGN: (value1: number) => value1,
}

//===== Parsing Helpers =====//

const strToNumber = (stringValue: string): number | undefined => {
  const numberValue = Number(stringValue)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

const inputToValue = (input: string): Wire | number => {
  const numberValue = strToNumber(input)
  return numberValue !== undefined ? numberValue : input
}

const orderGates = (circuitInfo: CircuitInfo): CircuitInfo => {
  const { gates } = circuitInfo

  const sortedGates = []
  const definedOutputs = new Set<Wire>()

  for (const [wire, value] of circuitInfo.wires.entries()) {
    if (value !== undefined) {
      definedOutputs.add(wire)
    }
  }

  while (gates.length) {
    for (let i = gates.length - 1; i >= 0; i--) {
      const gate = gates[i]
      const inputWires: Wire[] = gate.inputs.filter((input) => typeof input === 'string')

      if (inputWires.every((input) => definedOutputs.has(input))) {
        sortedGates.push(gate)
        definedOutputs.add(gate.output)

        gates.splice(i, 1)
      }
    }
  }

  circuitInfo.gates = sortedGates

  return circuitInfo
}

//===== Input Parsing =====//

const parseInput = (input: string): CircuitInfo => {
  const wireRegex = /\b[a-z]+\b/g
  const wireMatch = input.match(wireRegex) ?? []
  const wires: WireMap = new Map<Wire, number | undefined>([...wireMatch.sort()].map((wire) => [wire, undefined]))

  const inputSignalRegex = /^(\d+) -> ([a-z]+)$/
  const operationRegex = /^([a-z]+|\d+)? ?(AND|OR|NOT|LSHIFT|RSHIFT)? ?([a-z]+|\d+)? -> ([a-z]+)$/

  const gates: Gate[] = []
  for (const line of input.split('\n')) {
    let match = inputSignalRegex.exec(line)

    if (match) {
      const [, strValue, wire] = match
      wires.set(wire, strToNumber(strValue))
      continue
    }

    match = operationRegex.exec(line)
    if (match) {
      const [, input1, operatorStr, input2, output] = match
      gates.push({
        operation: operations[operatorStr ?? 'DIRECT_ASSIGN'],
        inputs: [inputToValue(input1), inputToValue(input2)],
        output,
      })
      continue
    }

    throw new Error(`Invalid line: ${line}`)
  }

  return orderGates({
    wires,
    gates,
  })
}

//===== Main Functions =====//

const getInputs = (gate: Gate, wires: WireMap): [number, number] => {
  const [input1, input2] = gate.inputs

  const value1 = typeof input1 === 'number' ? input1 : (wires.get(input1) ?? NaN)
  const value2 = typeof input2 === 'number' ? input2 : (wires.get(input2) ?? NaN)

  return [value1, value2]
}

const runSystem = ({ wires, gates }: CircuitInfo): number => {
  for (const gate of gates) {
    const [value1, value2] = getInputs(gate, wires)
    wires.set(gate.output, gate.operation(value1, value2))
  }

  const aValue = wires.get('a')
  if (aValue === undefined) throw new Error('Wire a value is undefined')

  return aValue
}

const resetSystem = (newInputValue: number, circuitInfo: CircuitInfo): void => {
  for (const wire of circuitInfo.wires.keys()) {
    circuitInfo.wires.set(wire, undefined)
  }

  circuitInfo.wires.set('b', newInputValue)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 16076,
    part2: params.isTest ? undefined : 2797,
  }

  const circuitInfo = parseInput(await getInput(params))

  const part1Answer = runSystem(circuitInfo)
  resetSystem(part1Answer, circuitInfo)
  const part2Answer = runSystem(circuitInfo)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer : undefined,
    solution,
  })
}
