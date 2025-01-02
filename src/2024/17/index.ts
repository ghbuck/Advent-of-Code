import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'
import { Device } from './Device.js'

export type Opcode = number
export type Operand = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const parseInput = (input: string): [Map<string, bigint>, number[]] => {
  const [registersInput, programInput] = input.replace(/(Register|Program):? /g, '').split('\n\n')

  const parsedRegisterInput = registersInput.split('\n').map((line: string): [string, bigint] => {
    const match = line.match(/([A-C]): (\d+)/)
    if (match !== null) {
      return [match[1], BigInt(match[2])]
    } else {
      return ['', 0n]
    }
  })

  return [new Map<string, bigint>(parsedRegisterInput), programInput.split(',').map(Number)]
}

const runProgram = (initialRegisterInfo: Map<string, bigint>, program: number[]): string => {
  const device = new Device(initialRegisterInfo)
  return device.run(program)
}

const reverseRunProgram = (initialRegisterInfo: Map<string, bigint>, program: number[]): bigint => {
  let values = [0n]

  const device = new Device(initialRegisterInfo)
  for (const desiredInt of [...program].reverse()) {
    const possibleValues: bigint[] = []

    for (const value of values) {
      const startValue = value << 3n
      const endValue = startValue + 7n

      for (let index = startValue; index <= endValue; ++index) {
        device.reset()
        device.setRegister('A', index)

        const output = device.run(program)
        const firstInt = Number(output.split(',')[0])

        if (firstInt === desiredInt) possibleValues.push(index)
      }
    }

    values = [...possibleValues]
  }

  return values[0]
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? '4,6,3,5,6,3,5,2,1,0' : '4,3,2,6,4,5,3,2,4',
    part2: params.isTest ? (params.testPart === 2 ? 117440n : undefined) : 164540892147389n,
  }

  const [initialRegisterInfo, program] = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? runProgram(initialRegisterInfo, program) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? reverseRunProgram(initialRegisterInfo, program) : undefined,
    solution,
  })
}
