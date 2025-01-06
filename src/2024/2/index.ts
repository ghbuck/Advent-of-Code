import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { isBetween } from '@utils/maths/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface ReportState {
  isSafe: boolean
  isDescending: boolean | undefined
  unsafeCount: number
}

const checkValues = (item1: number, item2: number, state: ReportState): ReportState => {
  const diff = item1 - item2
  const localIsDescending = diff > 0

  if (state.isDescending === undefined) {
    state.isDescending = localIsDescending
  }

  if (state.isDescending !== localIsDescending || !isBetween(Math.abs(diff), 0, 4)) {
    ++state.unsafeCount
  }

  return state
}

const checkReport = (report: number[]): ReportState => {
  let reportState: ReportState = {
    isSafe: true,
    isDescending: undefined,
    unsafeCount: 0,
  }

  const maxIndex = report.length - 2
  for (let index = 0; index <= maxIndex; ++index) {
    const nextIndex = index + 1
    reportState = checkValues(report[index], report[nextIndex], reportState)
  }

  return {
    ...reportState,
    isSafe: reportState.unsafeCount === 0,
  }
}

const getNumSafeReports = (inputArray: number[][], maxUnsafe: 0 | 1 = 0): number => {
  let numSafeReports = 0

  for (const report of inputArray) {
    let reportState = checkReport(report)

    if (reportState.isSafe) {
      ++numSafeReports
    }

    if (!reportState.isSafe && maxUnsafe > 0) {
      for (let index = 0; index < report.length; ++index) {
        const testReport = [...report]
        testReport.splice(index, 1)

        reportState = checkReport(testReport)

        if (reportState.isSafe) {
          ++numSafeReports
          break
        }
      }
    }
  }

  return numSafeReports
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 2 : 624,
    part2: params.isTest ? 4 : 658,
  }

  const input = await getInput(params)
  const inputArray = input.split('\n').map((row: string) => row.split(/\s+/).map(Number))

  const answer1 = getNumSafeReports(inputArray)
  const answer2 = getNumSafeReports(inputArray, 1)

  printAnswers({
    params,
    answer1,
    answer2,
    solution,
  })
}
