import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): string[][] => {
  const baseArray = input.split('\n').map((line: string) => line.split(''))
  return baseArray
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : undefined,
    part2: params.isTest ? undefined : undefined,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: undefined,
    answer2: undefined,
    solution,
  })
}
