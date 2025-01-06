import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

type Wire = string

enum BitwiseOperator {
  AND,
  OR,
  XOR,
}

interface Gate {
  operator: BitwiseOperator
  inputs: [Wire, Wire]
  output: Wire
  hasRun: boolean
}

interface HalfAdder {
  bitString: string
  and1: Gate
  xor1: Gate
}

interface FullAdder extends HalfAdder {
  and2: Gate | undefined
  or: Gate | undefined
  xor2: Gate | undefined
  carryIn: Gate | undefined
}

interface GateCheck {
  inputs: boolean
  output: boolean
}

interface AdderCheck {
  and1: GateCheck
  and2: GateCheck
  or: GateCheck
  xor1: GateCheck
  xor2: GateCheck
}

interface ParseInfo {
  wires: Map<Wire, number | undefined>
  gates: Gate[]
}

const parseInput = (input: string): ParseInfo => {
  const [wireInput, gateInput] = input.split('\n\n')

  const wireMatch = gateInput.match(/\b[a-z][a-z0-9][a-z0-9]\b/g) ?? []
  const wires = new Map<Wire, number | undefined>([...wireMatch.sort()].map((wire) => [wire, undefined]))

  for (const value of wireInput.split('\n')) {
    const [wire, valueStr] = value.split(': ')
    wires.set(wire, parseInt(valueStr))
  }

  const gates = gateInput.split('\n').map((gate: string): Gate => {
    const [inputWire1, operator, inputWire2, outputWire] = gate.split(/ (?:-> )?/)
    return {
      operator: BitwiseOperator[operator as keyof typeof BitwiseOperator],
      inputs: [inputWire1, inputWire2].sort((a, b) => a.localeCompare(b)) as [Wire, Wire],
      output: outputWire,
      hasRun: false,
    }
  })

  return {
    wires,
    gates,
  }
}

const hasUndefined = (wires: Map<Wire, number | undefined>): boolean => [...wires.values()].filter((value) => value === undefined).length > 0
const hasUnrun = (gates: Gate[]): boolean => gates.filter((gate: Gate) => !gate.hasRun).length > 0

const runSystem = ({ wires, gates }: ParseInfo): number[] => {
  do {
    for (const gate of gates) {
      if (gate.hasRun) continue

      const [wire1, wire2] = gate.inputs
      const [value1, value2] = [wires.get(wire1), wires.get(wire2)]

      if (value1 === undefined || value2 === undefined) continue

      let outputValue: number
      switch (gate.operator) {
        case BitwiseOperator.AND:
          outputValue = value1 & value2
          break
        case BitwiseOperator.OR:
          outputValue = value1 | value2
          break
        case BitwiseOperator.XOR:
          outputValue = value1 ^ value2
          break
      }

      wires.set(gate.output, outputValue)
      gate.hasRun = true
    }
  } while (hasUnrun(gates) && hasUndefined(wires))

  const zWires = [...wires.entries()].filter(([key]) => key.startsWith('z')).map(([, value]) => value)

  const zWiresValues: number[] = []
  for (const wire of zWires) {
    if (wire === undefined) throw new Error('z wire value is undefined')
    zWiresValues.push(wire)
  }

  return zWiresValues
}

const calculateDecimalOutput = ({ wires, gates }: ParseInfo): number => {
  const systemOutput = runSystem({ wires, gates })
  const binaryString = systemOutput.reverse().join('')

  return parseInt(binaryString, 2)
}

const createHalfAdder = (gate1: Gate, gate2: Gate): HalfAdder => {
  const and1 = gate1.operator === BitwiseOperator.AND ? gate1 : gate2.operator === BitwiseOperator.AND ? gate2 : undefined
  const xor1 = and1 === gate1 ? gate2 : gate1

  if (and1 === undefined) throw new Error('First AND gate found')
  if (xor1 === undefined) throw new Error('First XOR gate found')

  const gate1BitString = gate1.inputs[0].substring(1)
  const gate2BitString = gate2.inputs[0].substring(1)

  if (gate1BitString !== gate2BitString) throw new Error('Bitwise gates are not in order')

  return { bitString: gate1BitString, and1, xor1 }
}

const createFullAdder = (halfAdder: HalfAdder, carryIn: Gate | undefined, gates: Gate[]): FullAdder => {
  const and1Connections = gates.filter(({ inputs }: Gate) => inputs.includes(halfAdder.and1.output))
  const xor1Connections = gates.filter(({ inputs }: Gate) => inputs.includes(halfAdder.xor1.output))

  // and1Connections should only have 1 item and xor1Connections should have 2
  return {
    ...halfAdder,
    carryIn,
    and2: xor1Connections.find(({ operator }: Gate) => operator === BitwiseOperator.AND),
    or: and1Connections.find(({ operator }: Gate) => operator === BitwiseOperator.OR),
    xor2: xor1Connections.find(({ operator }: Gate) => operator === BitwiseOperator.XOR),
  }
}

const hasInput = (gate1: Gate | undefined, gate2: Gate | undefined): boolean =>
  gate1 !== undefined && gate2 !== undefined && gate1.inputs.includes(gate2.output)
const outputStartsWith = (gate: Gate | undefined, value: string): boolean => gate !== undefined && gate.output.startsWith(value)

const checkTheAdder = (adder: FullAdder, badWires: Set<string>) => {
  // a note for 'or.ouput': the final bit, here 45, is simply the carry from the penultimate bit
  const adderCheck: AdderCheck = {
    and1: {
      inputs: true,
      output: hasInput(adder.or, adder.and1),
    },
    and2: {
      inputs: hasInput(adder.and2, adder.xor1) && hasInput(adder.and2, adder.carryIn),
      output: hasInput(adder.or, adder.and2),
    },
    or: {
      inputs: hasInput(adder.or, adder.and1) && hasInput(adder.or, adder.and2),
      output: adder.bitString === '44' ? outputStartsWith(adder.or, 'z') : !outputStartsWith(adder.or, 'z'),
    },
    xor1: {
      inputs: true,
      output: hasInput(adder.xor2, adder.xor1),
    },
    xor2: {
      inputs: hasInput(adder.xor2, adder.xor1) && hasInput(adder.xor2, adder.carryIn),
      output: outputStartsWith(adder.xor2, `z${adder.bitString}`),
    },
  }

  // if any of the checks fail, mark the bad wires
  for (const [key, value] of Object.entries(adderCheck) as [keyof FullAdder, GateCheck][]) {
    if (value.inputs === true && value.output === true) continue

    const gate = adder[key] as Gate | undefined
    if (gate !== undefined && !value.output) {
      if (key !== 'and2' || adder.or !== undefined) {
        badWires.add(gate.output)
      }
    }
  }
}

const findBadWires = (gates: Gate[]): string => {
  const badWires = new Set<string>()

  let carryIn: Gate | undefined

  // start by finding all gates that have an x wire and a y wire as inputs
  // and then sorting them by ascending order of the bit number of the x wire
  const xyGates = gates
    .filter(({ inputs }: Gate) => inputs[0].startsWith('x') && inputs[1].startsWith('y'))
    .sort((a: Gate, b: Gate) => a.inputs[0].localeCompare(b.inputs[0]))

  for (let index = 0; index < xyGates.length; ++index) {
    // each bit should have two gates: an AND and an XOR
    const halfAdder = createHalfAdder(xyGates[index], xyGates[++index])

    // The first adder is only a half adder and therefore is treated differently.
    // We check for index 1 because we iterated index already above for gate2
    if (index === 1) {
      // the first half-adder should XOR directly to z00
      if (outputStartsWith(halfAdder.and1, 'z')) {
        badWires.add(halfAdder.and1.output)
      }
      if (!outputStartsWith(halfAdder.xor1, `z${halfAdder.bitString}`)) {
        badWires.add(halfAdder.xor1.output)
      }

      carryIn = halfAdder.and1
      continue
    }

    // let's fill out the rest of the full-adder interface and then check
    const fullAdder = createFullAdder(halfAdder, carryIn, gates)
    checkTheAdder(fullAdder, badWires)

    // carry over the or gate to the next full adder
    carryIn = fullAdder.or
  }

  return [...badWires].sort().join(',')
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 2024 : 55544677167336,
    part2: params.isTest ? 'z00,z01,z02,z05' : 'gsd,kth,qnf,tbt,vpm,z12,z26,z32',
  }

  const info = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? calculateDecimalOutput(info) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? findBadWires(info.gates) : undefined,
    solution,
  })
}
