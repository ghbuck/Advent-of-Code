import { PartNum } from 'utils/dataTypes/index.js'

export interface RunParams {
  year: number
  day: number
  part: PartNum
  isTest: boolean
}

export interface Day {
  run: (params: RunParams) => void
}

export interface Solution {
  part1: number | undefined
  part2: number | undefined
}

export interface AnswerParams {
  params: RunParams
  answer1: number | undefined
  answer2: number | undefined
  solution: Solution
}

export interface Coordinates {
  x: number
  y: number
}
