import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

import { Keypad } from './Keypad.js'
import { Robot } from './Robot.js'

interface SequenceResult {
  code: string
  // sequence: string
  numKeystrokes: number
}

const numbers = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['null', '0', 'A'],
]

const arrows = [
  ['null', '^', 'A'],
  ['<', 'v', '>'],
]

const calcComplexity = ({ code, numKeystrokes: cost }: SequenceResult): number => cost * Number(code.replaceAll(/[A-Za-z]+/g, ''))
const sumAllCodeComplexities = (sequences: SequenceResult[]): number => sequences.reduce((total, sequence) => total + calcComplexity(sequence), 0)

const runSolution = (codes: string[], numRobots: number, numKeypad: Keypad, dirKeypad: Keypad): number => {
  const sequences: SequenceResult[] = []

  let robot: Robot | undefined

  for (let robotNumber = 1; robotNumber <= numRobots; ++robotNumber) {
    const keypad = robotNumber === numRobots ? numKeypad : dirKeypad
    const nextRobot = new Robot(robotNumber, keypad, 'A', robot)

    robot = nextRobot
  }

  const numberRobot = robot
  if (numberRobot === undefined) throw new Error('No robots created')

  for (const code of codes) {
    const result: SequenceResult = {
      code,
      numKeystrokes: 0,
    }

    // if (code !== '539A') continue
    for (const button of code.split('')) {
      result.numKeystrokes += numberRobot.pressKey(button)
    }

    sequences.push(result)

    numberRobot.resetKeypad()
  }

  return sumAllCodeComplexities(sequences)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 126384 : 231564,
    part2: params.isTest ? 154115708116294 : 281212077733592,
  }

  const codes = (await getInput(params)).split('\n')

  const numberKeypad = new Keypad(numbers)
  const arrowKeypad = new Keypad(arrows)

  printAnswers({
    params,
    answer1: runSolution(codes, 3, numberKeypad, arrowKeypad),
    answer2: runSolution(codes, 26, numberKeypad, arrowKeypad),
    solution,
  })
}
