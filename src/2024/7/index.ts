import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

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

  const dp: Set<number>[] = Array(numbers.length + 1)
    .fill(null)
    .map(() => new Set<number>())

  dp[0].add(0)

  for (let index = 0; index < numbers.length; ++index) {
    const currentValue = numbers[index]

    for (const tableValue of dp[index]) {
      dp[index + 1].add(tableValue + currentValue)
      dp[index + 1].add(tableValue * currentValue)

      if (doConcat) {
        dp[index + 1].add(Number(`${tableValue}${currentValue}`))
      }
    }
  }

  return Array.from(dp[numbers.length]).includes(line.total)
}

const getTotalCalibrationResult = (
  lines: LineItem[],
  doConcat: boolean,
): number => {
  const totals: number[] = []

  for (const line of lines) {
    if (operationsCanMakeTotal(line, doConcat)) {
      totals.push(line.total)
    }
  }

  return totals.reduce((total: number, current: number) => total + current, 0)
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 3749 : 12839601725877,
    part2: params.isTest ? 11387 : 149956401519484,
  }

  const lines = getInput(params)
    .split('\n')
    .map((row: string): LineItem => {
      const [total, numbers] = row.split(': ')
      return {
        total: Number(total),
        numbers: numbers.split(' ').map(Number),
      }
    })

  printAnswers({
    params,
    answer1: getTotalCalibrationResult(lines, false),
    answer2: getTotalCalibrationResult(lines, true),
    solution,
  })
}
