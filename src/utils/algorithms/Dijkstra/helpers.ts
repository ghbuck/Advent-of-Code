import { DijkstraDirectionParams, DijkstraNode, DijkstraNodeV2, DijkstraStartNode } from '@utils/algorithms/Dijkstra/interfaces.js'
import {
  CardinalDirection,
  Point,
  cardinalDirections,
  eastPrioritizedDirections,
  getCardinalDirection,
  northPrioritizedDirections,
  southPrioritizedDirections,
  tokenDirections,
  westPrioritizedDirections,
} from '@utils/dataTypes/index.js'
import { Bounds } from '@utils/models/Bounds.js'

import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'

//#region local helpers

const assertIsNode = <T>(item: DijkstraNode | Point | T): item is DijkstraNode => {
  return (item as DijkstraNode).position !== undefined
}

const assertIsPoint = <T>(item: Point | T): item is Point => {
  return (item as Point).x !== undefined
}

const findNode = <T>(grid: T[][], item: T): DijkstraStartNode => {
  return {
    position: findPoint(grid, item),
  }
}

const findPoint = <T>(grid: T[][], item: T): Point => {
  const point: Point = { x: 0, y: 0 }

  outerLoop: for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      if (cell === item) {
        point.x = colIndex
        point.y = rowIndex

        break outerLoop
      }
    }
  }

  return point
}

const getPrioritizedDirections = (firstDirection: Point | undefined): [CardinalDirection, Point][] => {
  if (firstDirection === undefined) {
    return [...cardinalDirections.entries()]
  } else {
    switch (getCardinalDirection(firstDirection)) {
      case 'north':
        return northPrioritizedDirections
      case 'south':
        return southPrioritizedDirections
      case 'east':
        return eastPrioritizedDirections
      case 'west':
        return westPrioritizedDirections
    }
  }
}

//#endregion

//#region exported helpers

export const getSharedInfo = <T>(grid: T[][], start: DijkstraStartNode | T, end: Point | T): [Bounds, DijkstraStartNode, Point, T, string[][]] => {
  const bounds: Point = {
    x: grid[0].length - 1,
    y: grid.length - 1,
  }
  const startNode = assertIsNode(start) ? start : findNode(grid, start)

  const endPoint = assertIsPoint(end) ? end : findPoint(grid, end)
  const endChar = !assertIsPoint(end) ? end : grid[endPoint.y][endPoint.x]

  const loggingGrid = JSON.parse(JSON.stringify(grid).replace('null', ' ')) as string[][]

  return [new Bounds({ max: bounds }), startNode, endPoint, endChar, loggingGrid]
}

export const pointsAreEqual = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y

export const getKey = ({ position, direction }: DijkstraNode | DijkstraNodeV2) =>
  `${position.x},${position.y}${direction !== undefined ? `,${direction.x},${direction.y}` : ''}`

export const processDirections = <T>({
  grid,
  current,
  bounds,
  endChar,
  blockedSpace,
  freeSpace,
  turnCost = 0,
  turnCostCalculator,
  moveCostCalculator,
  loggingGrid,
  handler,
}: DijkstraDirectionParams<T>) => {
  for (const [directionKey, direction] of getPrioritizedDirections(current.direction)) {
    const newPosition: Point = {
      x: current.position.x + direction.x,
      y: current.position.y + direction.y,
    }

    if (!bounds.isInside(newPosition)) continue

    const nextSpace = grid[newPosition.y][newPosition.x]

    const isEndSpace = endChar !== undefined && nextSpace === endChar
    const isBlockedSpace = blockedSpace !== undefined && nextSpace === blockedSpace
    const isFreeSpace = !isBlockedSpace && (freeSpace === undefined || nextSpace === freeSpace)

    if (isEndSpace || isFreeSpace) {
      const isTurn = current.direction && (current.direction.x !== direction.x || current.direction.y !== direction.y)

      const extraCost = isTurn ? (turnCostCalculator !== undefined ? turnCostCalculator(directionKey) : turnCost) : 0
      const moveCost = moveCostCalculator !== undefined ? moveCostCalculator(directionKey) : 1
      const newCost = current.cost + moveCost + extraCost

      const doAnimation = handler({ current, currentV2: current as DijkstraNodeV2, newPosition, newCost, extraCost, direction })

      if (doAnimation) {
        loggingGrid[newPosition.y][newPosition.x] = tokenDirections.get(directionKey) ?? '.'
        process.stdout.write(clearScreen + kleur.cyan(loggingGrid.map((row: string[]) => row.join('')).join('\n')))

        const start = Date.now()
        let now = start
        while (now - start < 33) {
          now = Date.now()
        }
      }
    }
  }
}

export const reconstructPath = (endNode: DijkstraNode, parentMap: Map<string, DijkstraNode>): DijkstraNode[] => {
  const path: DijkstraNode[] = []
  path.push(endNode)

  let currentKey = getKey(endNode)

  while (parentMap.has(currentKey)) {
    const current = parentMap.get(currentKey)
    if (current !== undefined) {
      path.push(current)
      currentKey = getKey(current)
    }
  }

  return path.reverse()
}

export const reconstructOptimalPaths = (endNode: DijkstraNodeV2): DijkstraNode[] => {
  const path: DijkstraNode[] = []
  path.push(endNode)

  let previousNode = endNode.previous

  while (previousNode !== undefined) {
    path.push(previousNode)
    previousNode = previousNode.previous
  }

  return path.reverse()
}
