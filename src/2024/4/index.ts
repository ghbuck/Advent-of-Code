import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

import { checkForX_MAS } from './x-masFunctions.js'
import { checkForXMAS } from './xmasFunctions.js'

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 18 : 2434,
    part2: params.isTest ? 9 : 1835,
  }

  const input = await getInput(params)
  const inputArray = input.split('\n').map((row: string) => row.split(''))

  printAnswers({
    params,
    answer1: checkForXMAS(inputArray),
    answer2: checkForX_MAS(inputArray),
    solution,
  })
}
