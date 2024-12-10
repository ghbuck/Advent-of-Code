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

interface RouteInfo {
  locations: Set<string>
  isLoop: boolean
}

const getStartingPosition = (map: string[][]): PositionInfo => {
  let point: Point = {
    x: 0,
    y: 0,
  }

  for (let rowIndex = 0; rowIndex < map.length; ++rowIndex) {
    const row = map[rowIndex]
    const caratIndex = row.indexOf('^')

    if (caratIndex >= 0) {
      point = {
        x: caratIndex,
        y: rowIndex,
      }

      break
    }
  }

  return {
    point,
    direction: {
      x: 0,
      y: -1,
    },
  }
}

const nextPositionOk = (nextPosition: PositionInfo | undefined, maxPosition: Point): boolean => {
  return nextPosition !== undefined && isBetween(nextPosition.point.x, 0, maxPosition.x, true) && isBetween(nextPosition.point.y, 0, maxPosition.y, true)
}

const getNextPosition = (currentPosition: PositionInfo): PositionInfo => {
  return {
    point: {
      x: currentPosition.point.x + currentPosition.direction.x,
      y: currentPosition.point.y + currentPosition.direction.y,
    },
    direction: currentPosition.direction,
  }
}

const changeDirection = (direction: Direction): Direction => {
  return {
    x: direction.x !== 0 ? 0 : direction.y < 0 ? 1 : -1,
    y: direction.y !== 0 ? 0 : direction.x < 0 ? -1 : 1,
  }
}

const processRoute = (map: string[][], maxPosition: Point, checkLoop = false): RouteInfo => {
  const locations = new Set<string>()

  let caratPosition = getStartingPosition(map)
  locations.add(JSON.stringify(caratPosition.point))

  let nextPosition = getNextPosition(caratPosition)

  let isLoop = false
  while (nextPositionOk(nextPosition, maxPosition)) {
    if (checkLoop && locations.has(JSON.stringify(nextPosition.point))) {
      isLoop = true
      break
    }

    if (map[nextPosition.point.y][nextPosition.point.x] === '#') {
      caratPosition.direction = changeDirection(caratPosition.direction)
      nextPosition = getNextPosition(caratPosition)
    }

    caratPosition = nextPosition
    locations.add(JSON.stringify(caratPosition.point))

    nextPosition = getNextPosition(caratPosition)
  }

  return {
    locations,
    isLoop,
  }
}

const findLoopObstructionLocationCount = (routeLocations: Set<string>, map: string[][], maxPoint: Point): Set<string> => {
  const locationsCopy = new Set<string>()
  for (const location of routeLocations) {
    locationsCopy.add(location)
  }

  const loopPositions = new Set<string>()

  const startingPosition = getStartingPosition(map)
  locationsCopy.delete(JSON.stringify(startingPosition.point))

  for (const locationString of locationsCopy) {
    const location = JSON.parse(locationString) as Point
    const mapClone = [...map]

    mapClone[location.y][location.x] = '#'

    if (processRoute(mapClone, maxPoint, true).isLoop) {
      loopPositions.add(locationString)
    }
  }

  return loopPositions
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

  const uniqueLocations = processRoute(map, maxPosition).locations
  const loopLocations = findLoopObstructionLocationCount(uniqueLocations, map, maxPosition)

  printAnswers({
    params,
    answer1: uniqueLocations.size,
    answer2: loopLocations.size,
    solution,
  })
}
