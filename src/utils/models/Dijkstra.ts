import { CardinalDirection, Point, cardinalDirections, eastPrioritizedDirections, getCardinalDirection, northPrioritizedDirections, southPrioritizedDirections, tokenDirections, westPrioritizedDirections } from '@utils/dataTypes/index.js'
import { isBetweenInclusive } from '@utils/maths/comparisons.js'
import { PriorityQueue } from '@utils/models/PriorityQueue.js'

import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'
import isEqual from 'lodash.isequal'

export interface DijkstraNode {
  position: Point
  cost: number
  direction?: Point
}

export interface DijkstraNodeV2 extends DijkstraNode {
  previous: DijkstraNodeV2 | undefined
}

type DijkstraStartNode = Omit<DijkstraNode | DijkstraNodeV2, 'cost'>

export interface DijkstraParams<T> {
  grid: T[][]
  start: DijkstraStartNode | T
  end: Point | T
  turnCost?: number
  turnCostCalculator?: (dirKey: CardinalDirection) => number
  moveCostCalculator?: (dirKey: CardinalDirection) => number
  freeSpace?: T
  blockedSpace?: T
  doAnimation?: boolean
}

export interface DijkstraResults {
  path: DijkstraNode[]
  cost: number
}

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

const outOfBounds = (point: Point, bounds: Point): boolean => !isBetweenInclusive(point.x, 0, bounds.x) || !isBetweenInclusive(point.y, 0, bounds.y)

const getKey = ({ position, direction }: DijkstraNode | DijkstraNodeV2) => {
  return `${position.x},${position.y}${direction !== undefined ? `,${direction.x},${direction.y}` : ''}`
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

export const runDijkstra = <T>({ grid, start, end, turnCost = 0, turnCostCalculator, moveCostCalculator, freeSpace, blockedSpace, doAnimation }: DijkstraParams<T>): DijkstraResults[] => {
  const results: DijkstraResults[] = []

  const bounds: Point = {
    x: grid[0].length - 1,
    y: grid.length - 1,
  }

  const visited = new Set<string>()
  const pq = new PriorityQueue<DijkstraNode>()
  const parentMap = new Map<string, DijkstraNode>()

  const startNode = assertIsNode(start) ? start : findNode(grid, start)

  const endPoint = assertIsPoint(end) ? end : findPoint(grid, end)
  const endChar = !assertIsPoint(end) ? end : grid[endPoint.y][endPoint.x]

  pq.enqueue({ ...startNode, cost: 0 }, 0)

  const loggingGrid = JSON.parse(JSON.stringify(grid).replace('null', ' ')) as string[][]

  while (!pq.isEmpty()) {
    const current = pq.dequeue()
    if (current === undefined) continue

    const currentKey = getKey(current)

    if (visited.has(currentKey)) continue
    visited.add(currentKey)

    if (isEqual(current.position, endPoint)) {
      results.push({
        path: reconstructDijkstraPath(current, parentMap),
        cost: current.cost,
      })
      continue
    }

    for (const [dirKey, direction] of getPrioritizedDirections(current.direction)) {
      const newPosition: Point = {
        x: current.position.x + direction.x,
        y: current.position.y + direction.y,
      }

      if (outOfBounds(newPosition, bounds)) continue

      const nextSpace = grid[newPosition.y][newPosition.x]

      const isEndSpace = endChar !== undefined && nextSpace === endChar
      const isBlockedSpace = blockedSpace !== undefined && nextSpace === blockedSpace
      const isFreeSpace = !isBlockedSpace && (freeSpace === undefined || nextSpace === freeSpace)

      if (isEndSpace || isFreeSpace) {
        const isTurn = current.direction && (current.direction.x !== direction.x || current.direction.y !== direction.y)

        const extraCost = isTurn ? (turnCostCalculator !== undefined ? turnCostCalculator(dirKey) : turnCost) : 0
        const moveCost = moveCostCalculator !== undefined ? moveCostCalculator(dirKey) : 1
        const newCost = current.cost + moveCost + extraCost

        const newNode: DijkstraNode = { position: newPosition, cost: newCost, direction: direction }
        const newKey = getKey(newNode)

        if (!visited.has(newKey)) {
          pq.enqueue(newNode, newCost)
          parentMap.set(newKey, current)

          if (doAnimation) {
            loggingGrid[newPosition.y][newPosition.x] = tokenDirections.get(dirKey) ?? '.'
            process.stdout.write(clearScreen + kleur.cyan(loggingGrid.map((row: string[]) => row.join('')).join('\n')))

            const start = Date.now()
            let now = start
            while (now - start < 100) {
              now = Date.now()
            }
          }
        }
      }
    }
  }

  return results
}

function reconstructDijkstraPath(endNode: DijkstraNode, parentMap: Map<string, DijkstraNode>): DijkstraNode[] {
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

export const findAllOptimalPaths = <T>({ grid, start, end, turnCost = 0, turnCostCalculator, moveCostCalculator, freeSpace, blockedSpace }: DijkstraParams<T>): DijkstraResults[] => {
  const optimalPaths: DijkstraNodeV2[] = []

  const bounds: Point = {
    x: grid[0].length - 1,
    y: grid.length - 1,
  }

  const best = new Map<string, number>()
  const queue = new PriorityQueue<DijkstraNodeV2>()

  const startNode = assertIsNode(start) ? start : findNode(grid, start)

  const endPoint = assertIsPoint(end) ? end : findPoint(grid, end)
  const endChar = !assertIsPoint(end) ? end : grid[endPoint.y][endPoint.x]

  queue.enqueue({ ...startNode, cost: 0, previous: undefined }, 0)

  let cheapestPathCost = Infinity

  while (!queue.isEmpty()) {
    const current = queue.dequeue()
    if (current === undefined) continue

    const currentKey = getKey(current)
    const bestSoFar = best.get(currentKey) ?? Infinity

    if (current.cost > bestSoFar) continue

    best.set(currentKey, current.cost)

    if (isEqual(current.position, endPoint)) {
      if (current.cost > cheapestPathCost) continue
      if (current.cost < cheapestPathCost) optimalPaths.length = 0

      optimalPaths.push(current)
      cheapestPathCost = current.cost

      continue
    }

    for (const [directionKey, direction] of getPrioritizedDirections(current.direction)) {
      const newPosition: Point = {
        x: current.position.x + direction.x,
        y: current.position.y + direction.y,
      }

      if (outOfBounds(newPosition, bounds)) continue

      const nextSpace = grid[newPosition.y][newPosition.x]

      const isEndSpace = endChar !== undefined && nextSpace === endChar
      const isBlockedSpace = blockedSpace !== undefined && nextSpace === blockedSpace
      const isFreeSpace = !isBlockedSpace && (freeSpace === undefined || nextSpace === freeSpace)

      if (isEndSpace || isFreeSpace) {
        const isTurn = current.direction && (current.direction.x !== direction.x || current.direction.y !== direction.y)

        const extraCost = isTurn ? (turnCostCalculator !== undefined ? turnCostCalculator(directionKey) : turnCost) : 0
        const moveCost = moveCostCalculator !== undefined ? moveCostCalculator(directionKey) : 1
        const newCost = current.cost + moveCost + extraCost

        if (newCost < cheapestPathCost && newCost - (current.previous?.cost ?? 0) !== 1000) {
          queue.enqueue({ position: newPosition, cost: newCost, direction: direction, previous: current }, 0)
        }
      }
    }
  }

  return optimalPaths.map(
    (node: DijkstraNodeV2): DijkstraResults => ({
      path: reconstructOptimalPaths(node),
      cost: node.cost,
    }),
  )
}

function reconstructOptimalPaths(endNode: DijkstraNodeV2): DijkstraNode[] {
  const path: DijkstraNode[] = []
  path.push(endNode)

  let previousNode = endNode.previous

  while (previousNode !== undefined) {
    path.push(previousNode)
    previousNode = previousNode.previous
  }

  return path.reverse()
}
