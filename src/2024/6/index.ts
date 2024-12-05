import { Coordinates, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { isBetween } from 'utils/maths/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface Direction {
  x: -1 | 0 | 1
  y: -1 | 0 | 1
}

interface ObstructionInfo {
  coordinates: Coordinates
  newDirection: Direction
}

interface KnownObstructionInfo {
  first: ObstructionInfo
  second: ObstructionInfo
  third: ObstructionInfo
}

interface RouteInfo {
  numUniqueLocations: number
  numAddedObstructions: number
}

const getStartingPosition = (map: string[][]): Coordinates => {
  let caratPosition: Coordinates = {
    x: 0,
    y: 0,
  }

  for (
    let rowIndex = 0;
    rowIndex < map.length && caratPosition === undefined;
    ++rowIndex
  ) {
    const row = map[rowIndex]
    const caratIndex = row.indexOf('^')

    if (caratIndex >= 0) {
      caratPosition = {
        x: caratIndex,
        y: rowIndex,
      }
    }
  }

  return caratPosition
}

const nextPositionOk = (
  nextPosition: Coordinates,
  maxPosition: Coordinates,
): boolean => {
  return (
    isBetween(nextPosition.x, 0, maxPosition.x, true) &&
    isBetween(nextPosition.y, 0, maxPosition.y, true)
  )
}

const compareDirections = (dir1: Direction, dir2: Direction): boolean => {
  return dir1.x === dir2.x && dir1.y === dir2.y
}

const calculateLoopPositions = (
  obstructionPositions: ObstructionInfo[],
): Set<string> => {
  const addedObstructions = new Set<string>()

  for (const position of obstructionPositions) {
    let secondPosition: ObstructionInfo | undefined
    let thirdPosition: ObstructionInfo | undefined

    if (compareDirections(position.newDirection, { x: 1, y: 0 })) {
      secondPosition = obstructionPositions.find(
        (item: ObstructionInfo) =>
          item.coordinates.y === position.coordinates.y + 1,
      )
      if (secondPosition !== undefined) {
        thirdPosition = obstructionPositions.find(
          (item: ObstructionInfo) =>
            item.coordinates.y === position.coordinates.y + 1,
        )
      }
    } else if (compareDirections(position.newDirection, { x: -1, y: 0 })) {
      break
    } else if (compareDirections(position.newDirection, { x: 0, y: 1 })) {
      break
    } else if (compareDirections(position.newDirection, { x: 0, y: -1 })) {
      break
    }

    if (secondPosition !== undefined && thirdPosition !== undefined) {
      const knownPositions: KnownObstructionInfo = {
        first: position,
        second: secondPosition,
        third: thirdPosition,
      }
      console.log(knownPositions)
    }
  }

  return addedObstructions
}

const processRoute = (map: string[][], maxPosition: Coordinates): RouteInfo => {
  const uniquePositions = new Set<string>()
  const obstructionPositions: ObstructionInfo[] = []

  let caratPosition = getStartingPosition(map)
  uniquePositions.add(`${caratPosition.x}, ${caratPosition.y}`)

  let direction: Direction = {
    x: 0,
    y: -1,
  }

  let nextPosition: Coordinates = {
    x: 0,
    y: 0,
  }

  while (nextPositionOk(nextPosition, maxPosition)) {
    nextPosition = {
      x: caratPosition.x + direction.x,
      y: caratPosition.y + direction.y,
    }

    if (nextPositionOk(nextPosition, maxPosition)) {
      if (map[nextPosition.y][nextPosition.x] === '#') {
        if (direction.x === 0) {
          direction = {
            x: direction.y < 0 ? 1 : -1,
            y: 0,
          }
        } else if (direction.y === 0) {
          direction = {
            x: 0,
            y: direction.x < 0 ? -1 : 1,
          }
        }

        obstructionPositions.push({
          coordinates: {
            x: nextPosition.x,
            y: nextPosition.y,
          },
          newDirection: {
            x: direction.x,
            y: direction.y,
          },
        })

        nextPosition = {
          x: caratPosition.x + direction.x,
          y: caratPosition.y + direction.y,
        }
      }

      caratPosition = nextPosition
      uniquePositions.add(`${caratPosition.x}, ${caratPosition.y}`)
    }
  }

  return {
    numUniqueLocations: uniquePositions.size,
    numAddedObstructions: calculateLoopPositions(obstructionPositions).size,
  }
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 41 : 5212,
    part2: params.isTest ? 6 : undefined,
  }

  const map = getInput(params)
    .split('\n')
    .map((row: string) => row.split(''))

  const maxPosition: Coordinates = {
    x: map[0].length - 1,
    y: map.length - 1,
  }

  const routeInfo = processRoute(map, maxPosition)

  printAnswers({
    params,
    answer1: routeInfo.numUniqueLocations,
    answer2: routeInfo.numAddedObstructions,
    solution,
  })
}
