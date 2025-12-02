import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): number[][] => {
  const baseArray = input.split(/\s*,\s*/).map((line: string) => line.split('-').map((item) => Number(item)))
  return baseArray
}

const isSimpleRepeatingPattern = (idString: string, numRepeats: number): boolean => {
  const partialLength = Math.floor(idString.length / numRepeats)

  return idString.slice(0, partialLength).repeat(numRepeats) === idString
}

const isRepeatingPattern = (idString: string): boolean => {
  const length = idString.length
  const halfLength = Math.floor(length / 2)

  // Iterate from halfLength down to 1 to find any repeating pattern
  for (let sliceLength = halfLength; sliceLength >= 1; sliceLength--) {
    const numRepeats = length / sliceLength

    // Only consider if the string can be evenly divided
    if (numRepeats % 1 === 0 && isSimpleRepeatingPattern(idString, numRepeats)) {
      return true
    }
  }

  return false
}

const collectAndSumInvalidIds = (input: number[][], part: 1 | 2): number => {
  const invalidIds: number[] = []

  for (const [rangeStart, rangeEnd] of input) {
    for (let id = rangeStart; id <= rangeEnd; id++) {
      const idString = String(id)

      if (part === 1 && isSimpleRepeatingPattern(idString, 2)) {
        invalidIds.push(id)
      }

      if (part === 2 && isRepeatingPattern(idString)) {
        invalidIds.push(id)
      }
    }
  }

  return invalidIds.reduce((acc, val) => acc + val, 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 1227775554 : 15873079081,
    part2: params.isTest ? 4174379265 : 22617871034,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? collectAndSumInvalidIds(input, 1) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? collectAndSumInvalidIds(input, 2) : undefined,
    solution,
  })
}
