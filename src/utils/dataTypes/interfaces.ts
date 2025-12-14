import { Answer, PartNum } from '@utils/dataTypes/index.js'

export interface RunParams {
  year: number
  day: number
  defaultYear: number
  defaultDay: number
  part: PartNum
  isTest: boolean
  testPart: number
  createNewDay: boolean
  saveSessionId: boolean
  other?: Record<string, string>
}

export interface Day {
  run: (params: RunParams) => Promise<void>
}

export interface Solution {
  part1: Answer
  part2: Answer
}

export interface AnswerParams {
  params: RunParams
  answer1: Answer
  answer2?: Answer
  solution: Solution
}

export interface Point {
  x: number
  y: number
}

export interface Dimensions {
  length: number
  width: number
}
