import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface LineItem {
  total: number
  numbers: number[]
}

// this is 100% learning by doing
// I knew there had to be a higher math function that would do this efficiently
// so i'll still claim to know enough to ask the right questions…
// SEE: Dynamic Programming: https://www.geeksforgeeks.org/dynamic-programming/
const operationsCanMakeTotal = (line: LineItem, doConcat: boolean): boolean => {
  const numbers = line.numbers

  const dp: Set<number>[] = Array(numbers.length)
    .fill(null)
    .map(() => new Set<number>())

  dp[0].add(numbers[0])

  for (let index = 1; index < numbers.length; ++index) {
    const currentValue = numbers[index]

    for (const tableValue of dp[index - 1]) {
      dp[index].add(tableValue + currentValue)
      dp[index].add(tableValue * currentValue)

      if (doConcat) {
        dp[index].add(Number(`${tableValue}${currentValue}`))
      }
    }
  }

  return dp[dp.length - 1].has(line.total)
}

const getTotalCalibrationResult = (lines: LineItem[], doConcat: boolean): number => {
  const totals: number[] = []

  for (const line of lines) {
    if (operationsCanMakeTotal(line, doConcat)) {
      totals.push(line.total)
    }
  }

  return totals.reduce((total: number, current: number) => total + current, 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 3749 : 12839601725877,
    part2: params.isTest ? 11387 : 149956401519484,
  }

  const input = await getInput(params)
  const lines = input.split('\n').map((row: string): LineItem => {
    const [total, numbers] = row.split(': ')
    return {
      total: Number(total),
      numbers: numbers.split(' ').map(Number),
    }
  })

  printAnswers({
    params,
    answer1: params.part === 1 || params.part === 'all' ? getTotalCalibrationResult(lines, false) : undefined,
    answer2: params.part === 2 || params.part === 'all' ? getTotalCalibrationResult(lines, true) : undefined,
    solution,
  })
}
