import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface Lists {
  left: number[]
  right: number[]
}

const getLists = (inputArray: string[]): Lists => {
  const left: number[] = []
  const right: number[] = []

  for (const line of inputArray) {
    const parts = line.split(/\s+/)
    left.push(parseInt(parts[0]))
    right.push(parseInt(parts[1]))
  }

  left.sort()
  right.sort()

  return {
    left,
    right,
  }
}

const getDifferenceScore = ({ left, right }: Lists): number => {
  const diff: number[] = []

  for (let index = 0; index < left.length; ++index) {
    const sum = Math.abs(left[index] - right[index])
    diff.push(sum)
  }

  return diff.reduce((total, current) => (total += current), 0)
}

const getSimilarityScore = ({ left, right }: Lists): number => {
  return left.reduce((total, current) => (total += current * right.filter((item) => item === current).length), 0)
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 11 : 2164381,
    part2: params.isTest ? 31 : 20719933,
  }

  const inputArray = getInput(params).split('\n')
  const lists = getLists(inputArray)

  printAnswers({
    params,
    answer1: getDifferenceScore(lists),
    answer2: getSimilarityScore(lists),
    solution,
  })
}
