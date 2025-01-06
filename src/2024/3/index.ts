import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const getTotal = (inputString: string): number => {
  let answer = 0

  const multiplyItems = inputString.match(/(?<=mul\()(\d{1,3},\d{1,3})(?=\))/g)

  if (multiplyItems !== null) {
    answer = multiplyItems
      .map((item: string) => {
        return item
          .split(',')
          .map(Number)
          .reduce((total: number, current: number) => total * current, 1)
      })
      .reduce((total: number, current: number) => (total += current), 0)
  }

  return answer
}

const getTotalWithDoCommands = (inputString: string): number => {
  const newString = inputString
    .replaceAll('\n', '')
    .replace(/don't\(\).+?do\(\)/g, '')
    .replace(/don't\(\).+/g, '')

  return getTotal(newString)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 161 : 173517243,
    part2: params.isTest ? 48 : 100450138,
  }

  const inputString = await getInput(params)

  printAnswers({
    params,
    answer1: getTotal(inputString),
    answer2: getTotalWithDoCommands(inputString),
    solution,
  })
}
