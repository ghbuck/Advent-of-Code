import { Point, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface Operations {
  'turn on': (current: number) => number
  'turn off': (current: number) => number
  toggle: (current: number) => number
}

interface Instruction {
  action: keyof Operations
  start: Point
  end: Point
}

interface Input {
  instructions: Instruction[]
  grid: number[][]
}

const parseInput = (input: string): Input => {
  const instructionRegex = /(turn on|turn off|toggle) (\d+),(\d+) through (\d+),(\d+)/

  const instructions = input.split('\n').map((line: string) => {
    const match = instructionRegex.exec(line)
    if (!match) throw new Error(`Invalid instruction: ${line}`)

    return {
      action: match[1] as Instruction['action'],
      start: { x: Number(match[2]), y: Number(match[3]) },
      end: { x: Number(match[4]), y: Number(match[5]) },
    }
  })

  return {
    instructions,
    grid: Array.from({ length: 1000 }, () => Array<number>(1000).fill(0)),
  }
}

const followInstructions = (input: Input, operations: Operations): number => {
  for (const instruction of input.instructions) {
    const minX = Math.min(instruction.start.x, instruction.end.x)
    const maxX = Math.max(instruction.start.x, instruction.end.x)
    const minY = Math.min(instruction.start.y, instruction.end.y)
    const maxY = Math.max(instruction.start.y, instruction.end.y)

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        input.grid[x][y] = operations[instruction.action](input.grid[x][y])
      }
    }
  }

  return input.grid.map((row) => row.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0)
}

const part1Answer = (input: Input): number => {
  const operations = {
    'turn on': () => 1,
    'turn off': () => 0,
    toggle: (current: number) => (current === 1 ? 0 : 1),
  }

  return followInstructions(input, operations)
}

const part2Answer = (input: Input): number => {
  const operations = {
    'turn on': (current: number) => current + 1,
    'turn off': (current: number) => Math.max(0, current - 1),
    toggle: (current: number) => current + 2,
  }

  return followInstructions(input, operations)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 543903,
    part2: params.isTest ? undefined : 14687245,
  }

  const part1Input = parseInput(await getInput(params))
  const part2Input = structuredClone(part1Input)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer(part1Input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer(part2Input) : undefined,
    solution,
  })
}
