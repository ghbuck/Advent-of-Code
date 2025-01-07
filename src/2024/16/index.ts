import { findAllOptimalPaths } from '@utils/algorithms/Dijkstra/index.js'
import { DijkstraNode, DijkstraResults } from '@utils/algorithms/Dijkstra/interfaces.js'
import { Point, RunParams, Solution, cardinalDirections } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const findCheapestPath = (grid: string[][]): DijkstraResults[] => {
  let start: Point = { x: 0, y: 0 }

  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, item] of row.entries()) {
      if (item === 'S') {
        start = { x: colIndex, y: rowIndex }
        break
      }
    }
  }

  return findAllOptimalPaths<string>({
    grid,
    start: {
      position: start,
      direction: cardinalDirections.get('east'),
    },
    end: 'E',
    turnCost: 1000,
    freeSpace: '.',
    blockedSpace: '#',
  })
}

const countSharedPathLocations = (results: DijkstraResults[], cheapestCost: number): Set<string> => {
  const sharedPathLocations = new Set<string>()

  results
    .filter((result: DijkstraResults) => result.cost === cheapestCost)
    .flatMap((result: DijkstraResults) => result.path)
    .forEach((node: DijkstraNode) => {
      sharedPathLocations.add(`${node.position.x},${node.position.y}`)
    })

  return sharedPathLocations
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 11048 : 109516,
    part2: params.isTest ? 64 : 568,
  }

  const input = await getInput(params)
  const grid = input.split('\n').map((row: string) => row.split(''))

  const results = findCheapestPath(grid)
  const cheapestCost = results[0].cost

  const bestSeats = countSharedPathLocations(results, cheapestCost)

  printAnswers({
    params,
    answer1: cheapestCost,
    answer2: bestSeats.size,
    solution,
  })
}
