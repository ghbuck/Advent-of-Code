import { aStar } from '@utils/algorithms/aStar.js'
import { Point, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const freeSpace = '.'
const blockedSpace = '#'

const findShortestPath = (points: Point[], bounds: Point, isTest: boolean): number => {
  const maxBytes = isTest ? 12 : 1024

  const grid = Array.from({ length: bounds.y + 1 }, () => Array.from({ length: bounds.x + 1 }, () => freeSpace))

  for (let byteNum = 1; byteNum <= maxBytes; ++byteNum) {
    const point = points[byteNum - 1]
    grid[point.y][point.x] = blockedSpace
  }

  const path = aStar<string>({
    grid,
    start: { x: 0, y: 0 },
    goal: bounds,
    blockedSpace,
  })

  return path[path.length - 1].g
}

const findFirstBlockedPath = (points: Point[], bounds: Point): string => {
  const grid = Array.from({ length: bounds.y + 1 }, () => Array.from({ length: bounds.x + 1 }, () => freeSpace))

  const startingPoint = { x: 0, y: 0 }

  let blockingPoint = startingPoint
  for (const point of points) {
    grid[point.y][point.x] = blockedSpace

    const path = aStar<string>({
      grid,
      start: startingPoint,
      goal: bounds,
      blockedSpace,
    })

    if (path.length === 0) {
      blockingPoint = point
      break
    }
  }

  return `${blockingPoint.x},${blockingPoint.y}`
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 22 : 380,
    part2: params.isTest ? '6,1' : '26,50',
  }

  const inputString = await getInput(params)
  const points = inputString.split('\n').map((line: string): Point => {
    const lineItems = line.split(',').map(Number)
    return {
      x: lineItems[0],
      y: lineItems[1],
    }
  })
  const bounds = params.isTest ? { x: 6, y: 6 } : { x: 70, y: 70 }

  printAnswers({
    params,
    answer1: findShortestPath(points, bounds, params.isTest),
    answer2: findFirstBlockedPath(points, bounds),
    solution,
  })
}
