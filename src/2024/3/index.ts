import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

const getAnswer1 = (inputString: string): number => {
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

const getAnswer2 = (inputString: string): number => {
  const answer = 0
  let doMult = true

  const inputArray = inputString.replace('\n', '').split('')

  for (let index = 0; index < inputArray.length; ++index) {
    let chars = inputArray[index]

    if (chars === 'd') {
      chars = `${chars}${inputArray.slice(index + 1, index + 6).join('')}`

      if (chars.startsWith('do()') && !doMult) {
        doMult = true
      } else if (chars === "don't()" && doMult) {
        doMult = false
      }
    } else if (chars === 'm') {
      break //quiet eslint
    }
  }

  return answer
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 161 : 173517243,
    part2: params.isTest ? 48 : undefined,
  }

  const inputString = getInput(params)

  printAnswers({
    params,
    answer1: getAnswer1(inputString),
    answer2: getAnswer2(inputString),
    solution,
  })
}
