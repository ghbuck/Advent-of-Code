import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const operations = {
  '+': (values: number[]) => values.reduce((acc, val) => acc + val, 0),
  '*': (values: number[]) => values.reduce((acc, val) => acc * val, 1),
} as const

const part1 = (input: string): number => {
  const data = input.split('\n').map((line: string) => line.trim().split(/\s+/))

  const height: number = data.length
  const width: number = data[0].length

  const colVals: number[] = []

  // Iterate through each column
  for (let col = 0; col < width; col++) {
    const values: number[] = []
    const action: string = data[height - 1][col]

    // Gather all values in the column except the last row (which is the operation)
    for (let row = 0; row < height - 1; row++) {
      values.push(Number(data[row][col]))
    }

    // Perform the operation and store the result
    colVals.push(operations[action as keyof typeof operations](values))
  }

  // Sum all column results
  return colVals.reduce((acc, val) => acc + val, 0)
}

const part2 = (input: string): number => {
  const data = input.split('\n').map((line: string) => line.split(''))

  const height: number = data.length
  // Using Math.max to account b/c VSCode's editor may trim trailing spaces
  // I love it for making code cleaner, but it messes with fixed-width input parsing
  const width: number = Math.max(...data.map((line: string[]) => line.length))

  const colVals: number[] = []

  let colStore: number[] = []
  let action = ''

  // Iterate through each column
  for (let col = 0; col < width; col++) {
    const localColStore: string[] = []
    const localAction = data[height - 1][col]

    // if there's a new action, update it
    if (localAction && localAction !== ' ') {
      action = localAction
    }

    for (let row = 0; row < height - 1; row++) {
      localColStore.push(data[row][col])
    }

    // Join the column characters to form the number string
    const colString = localColStore.join('').trim()
    if (colString !== '') {
      colStore.push(Number(colString))
    }

    // If we hit a space in the action row or the last column, perform the operation
    if ((colString === '' && localAction === ' ') || col === width - 1) {
      colVals.push(operations[action as keyof typeof operations](colStore))

      colStore = []
      action = ''
    }
  }

  // Sum all column results
  return colVals.reduce((acc, val) => acc + val, 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 4277556 : 5060053676136,
    part2: params.isTest ? 3263827 : 9695042567249,
  }

  const input: string = await getInput(params)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1(input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2(input) : undefined,
    solution,
  })
}
