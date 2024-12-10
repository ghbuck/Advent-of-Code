import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { isBetween } from 'utils/maths/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface Direction {
  x: -1 | 0 | 1
  y: -1 | 0 | 1
}

interface PositionInfo {
  point: Point
  direction: Direction
}

const getStartingPosition = (map: string[][]): Point => {
  let caratPosition: Point = {
    x: 0,
    y: 0,
  }

  for (
    let rowIndex = 0;
    rowIndex < map.length;
    ++rowIndex
  ) {
    const row = map[rowIndex]
    const caratIndex = row.indexOf('^')

    if (caratIndex >= 0) {
      caratPosition = {
        x: caratIndex,
        y: rowIndex,
      }

      break
    }
  }

  return caratPosition
}

const nextPositionOk = (
  nextPosition: Point | undefined,
  maxPosition: Point,
): boolean => {
  return (
    nextPosition !== undefined &&
    isBetween(nextPosition.x, 0, maxPosition.x, true) &&
    isBetween(nextPosition.y, 0, maxPosition.y, true)
  )
}

const getNextPosition = (currentPosition: Point, direction: Direction): Point => {
  return {
      x: currentPosition.x + direction.x,
      y: currentPosition.y + direction.y,
    }
}

const changeDirection = (direction: Direction): Direction => {
  let newDirection: Direction = direction

  if (direction.x === 0) {
    newDirection = {
      x: direction.y < 0 ? 1 : -1,
      y: 0,
    }
  } else if (direction.y === 0) {
    newDirection = {
      x: 0,
      y: direction.x < 0 ? -1 : 1,
    }
  }

  return newDirection
}

const processRoute = (map: string[][], maxPosition: Point): number => {
  const uniquePositions = new Set<string>()

  let caratPosition = getStartingPosition(map)
  uniquePositions.add(JSON.stringify(caratPosition))

  let direction: Direction = {
    x: 0,
    y: -1,
  }

  let nextPosition: Point = getNextPosition(caratPosition, direction)

  while (nextPositionOk(nextPosition, maxPosition)) {
    if (map[nextPosition.y][nextPosition.x] === '#') {
      direction = changeDirection(direction)
      nextPosition = getNextPosition(caratPosition, direction)
    }

    caratPosition = nextPosition
    uniquePositions.add(JSON.stringify(caratPosition))

    nextPosition = getNextPosition(caratPosition, direction)
  }

  return uniquePositions.size
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 41 : 5212,
    part2: params.isTest ? 6 : 1767,
  }

  const map = getInput(params)
    .split('\n')
    .map((row: string) => row.split(''))

  const maxPosition: Point = {
    x: map[0].length - 1,
    y: map.length - 1,
  }

  printAnswers({
    params,
    answer1: processRoute(map, maxPosition),
    answer2: undefined,
    solution,
  })
}
