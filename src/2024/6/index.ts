import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { isBetween } from 'utils/maths/index.js'
import { printAnswers } from 'utils/printing/index.js'

const directions: number[][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

enum DirectionKey {
  up,
  right,
  down,
  left,
}

interface RouteInfo {
  uniqueLocations: Set<string>
  isLoop: boolean
}

const getStartingPosition = (map: string[][]): Point => {
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

  return point
}

const nextPointOk = (nextPoint: Point, maxPosition: Point): boolean => {
  return isBetween(nextPoint.x, 0, maxPosition.x, true) && isBetween(nextPoint.y, 0, maxPosition.y, true)
}

const getNextPoint = (currentPoint: Point, direction: DirectionKey): Point => {
  return {
    x: currentPoint.x + directions[direction][0],
    y: currentPoint.y + directions[direction][1],
  }
}

const changeDirection = (direction: DirectionKey): DirectionKey => {
  switch (direction) {
    case DirectionKey.up:
      return DirectionKey.right
    case DirectionKey.right:
      return DirectionKey.down
    case DirectionKey.down:
      return DirectionKey.left
    case DirectionKey.left:
      return DirectionKey.up
  }
}

const processRoute = (map: string[][], maxPosition: Point, checkLoop = false): RouteInfo => {
  const locations = new Set<string>()
  const uniqueLocations = new Set<string>()

  let caratPoint = getStartingPosition(map)
  let direction = DirectionKey.up

  uniqueLocations.add(`${caratPoint.x},${caratPoint.y}`)
  locations.add(`${caratPoint.x},${caratPoint.y},${direction}`)

  let isLoop = false
  while (true) {
    const nextPoint = getNextPoint(caratPoint, direction)

    const uniqueLocationString = `${nextPoint.x},${nextPoint.y}`
    const locationString = `${uniqueLocationString},${direction}`

    if (checkLoop && locations.has(locationString)) {
      isLoop = true
      break
    }

    if (!nextPointOk(nextPoint, maxPosition)) {
      break
    }

    if (map[nextPoint.y][nextPoint.x] === '#') {
      direction = changeDirection(direction)
    } else {
      uniqueLocations.add(uniqueLocationString)
      locations.add(locationString)

      caratPoint = nextPoint
    }
  }

  return {
    uniqueLocations,
    isLoop,
  }
}

const findLoopObstructionLocationCount = (routeLocations: Set<string>, map: string[][], maxPoint: Point): Set<string> => {
  const loopPositions = new Set<string>()

  const startingPoint = getStartingPosition(map)
  routeLocations.delete(`${startingPoint.x},${startingPoint.y}`)

  for (const locationString of routeLocations) {
    const parts = locationString.split(',').map(Number)
    const location: Point = { x: parts[0], y: parts[1] }

    const mapClone = structuredClone(map)
    mapClone[location.y][location.x] = '#'

    if (processRoute(mapClone, maxPoint, true).isLoop) {
      loopPositions.add(locationString)
    }
  }

  return loopPositions
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 41 : 5212,
    part2: params.isTest ? 6 : 1767,
  }

  const input = await getInput(params)
  const map = input.split('\n').map((row: string) => row.split(''))

  const maxPosition: Point = {
    x: map[0].length - 1,
    y: map.length - 1,
  }

  const uniqueLocations = processRoute(map, maxPosition).uniqueLocations
  const numUniqueLocations = uniqueLocations.size

  const loopLocations = findLoopObstructionLocationCount(uniqueLocations, map, maxPosition)

  printAnswers({
    params,
    answer1: numUniqueLocations,
    answer2: loopLocations.size,
    solution,
  })
}
