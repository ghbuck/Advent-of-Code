import { Answer, PartNum } from 'utils/dataTypes/index.js'

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
  part1: Answer
  part2: Answer
}

export interface AnswerParams {
  params: RunParams
  answer1: Answer
  answer2: Answer
  solution: Solution
}

export interface Point {
  x: number
  y: number
}
