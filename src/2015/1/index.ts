import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): string[] => {
  return input.split('')
}

const findFloor = (instructions: string[]): number => {
  let floor = 0

  for (const instruction of instructions) {
    if (instruction === '(') {
      floor++
    } else if (instruction === ')') {
      floor--
    }
  }

  return floor
}

const findBasementPosition = (instructions: string[]): number => {
  let floor = 0

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]

    if (instruction === '(') {
      floor++
    } else if (instruction === ')') {
      floor--
    }

    if (floor === -1) {
      return i + 1
    }
  }

  return -1
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 232,
    part2: params.isTest ? undefined : 1783,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? findFloor(input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? findBasementPosition(input) : undefined,
    solution,
  })
}
