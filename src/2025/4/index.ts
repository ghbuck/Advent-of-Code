import { Point, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { Bounds } from '@utils/models/Bounds.js'
import { printAnswers } from '@utils/printing/index.js'

import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'

const paperRoll = '@'

const parseInput = (input: string): string[][] => {
  const baseArray = input.split('\n').map((line: string) => line.split(''))
  return baseArray
}

const getSideNeighborCount = (point: Point, map: string[][]): number => {
  const leftNeighbor = map?.[point.y]?.[point.x - 1]
  const rightNeighbor = map?.[point.y]?.[point.x + 1]

  const leftNeighborValue = leftNeighbor === paperRoll ? 1 : 0
  const rightNeighborValue = rightNeighbor === paperRoll ? 1 : 0

  return leftNeighborValue + rightNeighborValue
}

const getNeighborCount = (point: Point, map: string[][], bounds: Bounds): number => {
  let neighborCount = 0

  const abovePoint = {
    x: point.x,
    y: point.y - 1,
  }
  const belowPoint = {
    x: point.x,
    y: point.y + 1,
  }

  if (bounds.isInside(abovePoint)) {
    neighborCount += getSideNeighborCount(abovePoint, map)
    neighborCount += map[abovePoint.y][abovePoint.x] === paperRoll ? 1 : 0
  }

  if (bounds.isInside(belowPoint)) {
    neighborCount += getSideNeighborCount(belowPoint, map)
    neighborCount += map[belowPoint.y][belowPoint.x] === paperRoll ? 1 : 0
  }

  neighborCount += getSideNeighborCount(point, map)

  return neighborCount
}

const findMoveablePaperRolls = (map: string[][]): Point[] => {
  const points: Point[] = []

  const numRows = map.length
  const numCols = map[0].length

  const bounds = new Bounds({
    max: {
      x: numRows - 1,
      y: numCols - 1,
    },
  })

  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    for (let colIndex = 0; colIndex < numCols; colIndex++) {
      const item = map[rowIndex][colIndex]
      const itemPoint: Point = { x: colIndex, y: rowIndex }

      if (item === paperRoll) {
        const numNeighbors = getNeighborCount(itemPoint, map, bounds)
        if (numNeighbors < 4) {
          points.push(itemPoint)
        }
      }
    }
  }

  return points
}

const clearPoints = (map: string[][], points: Point[]): void => {
  for (const point of points) {
    map[point.y][point.x] = 'x'
  }
}

const drawGrid = (map: string[][]): void => {
  let outputString = ''

  for (const row of map) {
    outputString += `${row.join('')}\n`
  }

  process.stdout.write(clearScreen + kleur.cyan(outputString))
}

const findTotalMoveablePaperRolls = (map: string[][], points: Point[], isTest: boolean): number => {
  let totalMovableRolls = 0

  let keepSearching = true
  while (keepSearching) {
    totalMovableRolls += points.length

    clearPoints(map, points)
    if (isTest) {
      drawGrid(map)
    }

    points = findMoveablePaperRolls(map)

    keepSearching = points.length > 0
  }

  return totalMovableRolls
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 13 : 1419,
    part2: params.isTest ? 43 : 8739,
  }

  const map = parseInput(await getInput(params))
  const initialMoveablePaperRolls = findMoveablePaperRolls(map)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? initialMoveablePaperRolls.length : undefined,
    answer2: params.part === 'all' || params.part === 2 ? findTotalMoveablePaperRolls(map, initialMoveablePaperRolls, params.isTest) : undefined,
    solution,
  })
}
