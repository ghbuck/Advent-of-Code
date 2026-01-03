import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

import { createHash } from 'node:crypto'

const findHashInput = (secretKey: string, searchValues: [string, string]): [number, number] => {
  const results: [number, number] = [-1, -1]

  let value = 0

  while (results.some((res) => res === -1)) {
    const hash = createHash('md5')
      .update(secretKey + value)
      .digest('hex')

    for (const [index, prefix] of searchValues.entries()) {
      if (results[index] === -1 && hash.startsWith(prefix)) {
        results[index] = value
      }
    }

    value++
  }

  return results
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 346386,
    part2: params.isTest ? undefined : 9958218,
  }

  const secretKey = await getInput(params)

  const [answer1, answer2] = findHashInput(secretKey, ['00000', '000000'])

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? answer1 : undefined,
    answer2: params.part === 'all' || params.part === 2 ? answer2 : undefined,
    solution,
  })
}
