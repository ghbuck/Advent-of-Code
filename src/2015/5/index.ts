import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): string[][] => {
  const baseArray = input.split('\n').map((line: string) => line.split(''))
  return baseArray
}

const part1Answer = (input: string[][]): number => {
  let niceStringCount = 0

  const vowels = ['a', 'e', 'i', 'o', 'u']
  const badStrings = ['ab', 'cd', 'pq', 'xy']

  for (const line of input) {
    let vowelCount = 0
    let hasDoubleLetter = false
    let hasBadString = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1] ?? ''

      if (vowels.includes(char)) vowelCount++
      if (!hasDoubleLetter && char === nextChar) hasDoubleLetter = true
      if (badStrings.includes(char + nextChar)) {
        hasBadString = true
        break
      }
    }

    niceStringCount += vowelCount >= 3 && hasDoubleLetter && !hasBadString ? 1 : 0
  }

  return niceStringCount
}

const part2Answer = (input: string[][]): number => {
  let niceStringCount = 0

  for (const line of input) {
    let charMinus2 = ''
    let charMinus1 = ''
    let char = ''

    let pairs: string[] = []
    let triples: string[] = []

    for (const currentChar of line) {
      charMinus2 = charMinus1
      charMinus1 = char
      char = currentChar

      pairs.push(charMinus1 + char)
      triples.push(charMinus2 + charMinus1 + char)
    }

    pairs = pairs.slice(1)
    triples = triples.slice(2)

    let hasRepeatingPair = false
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      // i+2 to avoid overlap
      if (pairs.indexOf(pair, i + 2) !== -1) {
        hasRepeatingPair = true
        break
      }
    }

    let hasSandwichedLetter = false
    for (const triple of triples) {
      if (triple[0] === triple[2]) {
        hasSandwichedLetter = true
        break
      }
    }

    niceStringCount += hasRepeatingPair && hasSandwichedLetter ? 1 : 0
  }

  return niceStringCount
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 2 : 238,
    part2: params.isTest ? 2 : 69,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer(input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer(input) : undefined,
    solution,
  })
}
