import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface IdDataSet {
  ranges: [number, number][]
  ids: number[]
}

const consolidateRanges = (ranges: [number, number][]): [number, number][] => {
  // Sort by start position
  const sorted = ranges.sort((a, b) => a[0] - b[0])
  const consolidated: [number, number][] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = consolidated[consolidated.length - 1]

    // If current range overlaps or is adjacent to the last consolidated range
    if (current[0] <= last[1] + 1) {
      // Merge ranges by extending the end if needed
      last[1] = Math.max(last[1], current[1])
    } else {
      // No overlap, add as new range
      consolidated.push(current)
    }
  }

  return consolidated
}

const parseInput = (input: string): IdDataSet => {
  const baseArray = input.split('\n\n').map((line: string) => line.split('\n'))

  const baseRanges: [number, number][] = baseArray[0].map((rangeLine: string) => {
    const [start, end] = rangeLine.split('-').map(Number)
    return [start, end]
  })

  return {
    ranges: consolidateRanges(baseRanges),
    ids: baseArray[1].map(Number),
  }
}

const isFresh = (id: number, ranges: [number, number][]): number => {
  let left = 0
  let right = ranges.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const [start, end] = ranges[mid]

    if (id >= start && id <= end) {
      return 1
    } else if (id < start) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return 0
}

const getNumFreshIngredients = (dataSet: IdDataSet): number => {
  return dataSet.ids.reduce((count, id) => count + isFresh(id, dataSet.ranges), 0)
}

const getNumFreshIds = (dataSet: IdDataSet): number => {
  return dataSet.ranges.reduce((count, [start, end]) => count + (end - start + 1), 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 3 : 773,
    part2: params.isTest ? 14 : 332067203034711,
  }

  const idDataSet = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? getNumFreshIngredients(idDataSet) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? getNumFreshIds(idDataSet) : undefined,
    solution,
  })
}
