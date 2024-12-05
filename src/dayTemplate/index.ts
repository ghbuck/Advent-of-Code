import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : undefined,
    part2: params.isTest ? undefined : undefined,
  }

  const inputString = getInput(params)

  printAnswers({
    params,
    answer1: undefined,
    answer2: undefined,
    solution,
  })
}
