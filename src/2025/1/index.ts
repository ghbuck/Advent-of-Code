import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): number[] => {
  const baseArray: number[] = input.split('\n').map((line: string) => {
    const direction = line.charAt(0)
    const delta = Number(line.slice(1))

    return direction === 'R' ? delta : -delta
  })
  return baseArray
}

const calculatePassword = (inputArray: number[], part: 1 | 2): number => {
  let zeroCount = 0
  let location = 50

  for (const delta of inputArray) {
    const oldLocation = location
    const newLocation = oldLocation + delta

    // The formula ((n % m) + m) % m is a common pattern to ensure
    // you get a positive result in the range [0, m-1]
    location = ((newLocation % 100) + 100) % 100

    if (part === 2) {
      // Count how many full 100s we moved
      zeroCount += Math.trunc(Math.abs(delta) / 100)

      // Now check if we crossed zero in the last partial move
      // We use delta % 100 to get the remaining distance after full 100s
      if (Math.sign(delta) > 0) {
        // If moving right, the value must be greater than 100 to cross zero
        if (oldLocation + (delta % 100) > 100) {
          zeroCount++
        }
      } else {
        // If moving left, the value must be less than 0 to cross zero
        if (oldLocation !== 0 && oldLocation + (delta % 100) < 0) {
          zeroCount++
        }
      }
    }

    // Finally, check if we ended up exactly on zero
    if (location === 0) {
      zeroCount++
    }
  }

  return zeroCount
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 3 : 1048,
    part2: params.isTest ? 6 : 6498,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? calculatePassword(input, 1) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? calculatePassword(input, 2) : undefined,
    solution,
  })
}
