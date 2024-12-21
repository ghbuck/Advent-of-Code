import { PartNum } from 'utils/dataTypes/index.js'

export interface RunParams {
  year: number
  day: number
  part: PartNum
  isTest: boolean
  createNewDay: boolean
  saveSessionId: boolean
}

export interface Day {
  run: (params: RunParams) => Promise<void>
}

export interface Solution {
  part1: number | string | undefined
  part2: number | string | undefined
}

export interface AnswerParams {
  params: RunParams
  answer1: number | string | undefined
  answer2: number | string | undefined
  solution: Solution
}

export interface Point {
  x: number
  y: number
}
