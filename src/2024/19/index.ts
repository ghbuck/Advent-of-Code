import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

const parseInput = (input: string): string[][] => {
  const baseArray = input.split('\n\n')
  return [baseArray[0].split(', '), baseArray[1].split('\n')]
}

const backtracker = (towels: string[], remaining: string, queue: Map<string, number>): number => {
  let ways = 0

  if (remaining === '') return 1
  if (queue.has(remaining)) return queue.get(remaining) ?? 0

  for (const block of towels) {
    if (remaining.startsWith(block)) {
      const newRemaining = remaining.slice(block.length)
      const newWays = backtracker(towels, newRemaining, queue)

      ways += newWays
    }
  }

  queue.set(remaining, ways)
  return ways
}

const countWays = (towels: string[], design: string): number => {
  return backtracker(towels, design, new Map<string, number>())
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 6 : 371,
    part2: params.isTest ? 16 : 650354687260341,
  }

  const [towels, designs] = parseInput(await getInput(params))

  const combosPossible: number[] = []
  for (const design of designs) {
    combosPossible.push(countWays(towels, design))
  }

  printAnswers({
    params,
    answer1: combosPossible.reduce((total: number, current: number) => total + (current > 0 ? 1 : 0), 0),
    answer2: combosPossible.reduce((total: number, current: number) => total + current, 0),
    solution,
  })
}
