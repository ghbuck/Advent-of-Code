import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { getManhattanDistance } from '@utils/maths/geometry.js'
import { runDijkstra } from '@utils/models/Dijkstra.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): string[][] => {
  return input.split('\n').map((line) => line.split(''))
}

const findNumberOfCheats = (grid: string[][], minTimeSaved: number, maxCheatTime: number): number => {
  let numberOfCheats = 0

  const cheatMoveCost = 2

  // there's only one path, so these are the baseline values
  const { path } = runDijkstra({
    grid,
    start: 'S',
    end: 'E',
    freeSpace: '.',
    blockedSpace: '#',
  })[0]

  // traverse path, examining for potential cheats
  const maxStartPointIndex = path.length - minTimeSaved + cheatMoveCost

  for (let cheatStartIndex = 0; cheatStartIndex <= maxStartPointIndex; ++cheatStartIndex) {
    const startPoint = path[cheatStartIndex]

    const minCheatEndIndex = cheatStartIndex + minTimeSaved + cheatMoveCost

    for (let cheatEndIndex = minCheatEndIndex; cheatEndIndex < path.length; ++cheatEndIndex) {
      const endPoint = path[cheatEndIndex]

      const normalTime = cheatEndIndex - cheatStartIndex
      const cheatCost = getManhattanDistance(endPoint.position, startPoint.position)

      if (cheatCost > maxCheatTime) continue
      if (normalTime - cheatCost >= minTimeSaved) {
        numberOfCheats++
      }
    }
  }

  return numberOfCheats
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 1507,
    part2: params.isTest ? undefined : 1037936,
  }

  const grid = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: findNumberOfCheats(grid, 100, 2),
    answer2: findNumberOfCheats(grid, 100, 20),
    solution,
  })
}
