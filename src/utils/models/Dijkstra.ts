import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'
import isEqual from 'lodash.isequal'
import { CardinalDirection, cardinalDirections, Point, tokenDirections } from 'utils/dataTypes/index.js'
import { isBetweenInclusive } from 'utils/maths/comparisons.js'
import { PriorityQueue } from 'utils/models/PriorityQueue.js'

export interface DijkstraNode {
  position: Point
  cost: number
  direction?: Point
}

export interface DijkstraParams<T> {
  grid: T[][]
  startNode: Omit<DijkstraNode, 'cost'>
  goal: Point
  turnCost?: number
  turnCostCalculator?: (dirKey: CardinalDirection) => number
  moveCostCalculator?: (dirKey: CardinalDirection) => number
  freeSpace?: T
  blockedSpace?: T
  endChar?: T
  doAnimation?: boolean
}

export interface DijkstraResults {
  path: DijkstraNode[]
  cost: number
}

const getKey = (p: Point, dir?: Point) => {
  return dir ? `${p.x},${p.y},${dir.x},${dir.y}` : `${p.x},${p.y}`
}

export const runDijkstra = <T>({ grid, startNode, goal, turnCost = 0, turnCostCalculator, moveCostCalculator, freeSpace, blockedSpace, endChar, doAnimation }: DijkstraParams<T>): DijkstraResults[] => {
  const results: DijkstraResults[] = []

  const maxRowIndex = grid.length - 1
  const maxColIndex = grid[0].length - 1

  const visited = new Set<string>()
  const pq = new PriorityQueue<DijkstraNode>()
  const parentMap = new Map<string, DijkstraNode>()

  pq.enqueue({ ...startNode, cost: 0 }, 0)

  const loggingGrid = JSON.parse(JSON.stringify(grid).replace('null', ' ')) as string[][]

  while (!pq.isEmpty()) {
    const current = pq.dequeue()
    if (current === undefined) continue

    const currKey = getKey(current.position, current.direction)

    if (visited.has(currKey)) continue
    visited.add(currKey)

    if (isEqual(current.position, goal)) {
      results.push({
        path: reconstructPath(current, parentMap),
        cost: current.cost,
      })
      continue
    }

    for (const [dirKey, direction] of cardinalDirections.entries()) {
      const newPosition: Point = {
        x: current.position.x + direction.x,
        y: current.position.y + direction.y,
      }

      if (!isBetweenInclusive(newPosition.x, 0, maxColIndex) || !isBetweenInclusive(newPosition.y, 0, maxRowIndex)) continue

      const nextSpace = grid[newPosition.y][newPosition.x]

      const isEndSpace = endChar !== undefined && nextSpace === endChar
      const isBlockedSpace = blockedSpace !== undefined && nextSpace === blockedSpace
      const isFreeSpace = !isBlockedSpace && (freeSpace === undefined || nextSpace === freeSpace)

      if (isEndSpace || isFreeSpace) {
        const isTurn = current.direction && (current.direction.x !== direction.x || current.direction.y !== direction.y)

        const extraCost = isTurn ? (turnCostCalculator !== undefined ? turnCostCalculator(dirKey) : turnCost) : 0
        const moveCost = moveCostCalculator !== undefined ? moveCostCalculator(dirKey) : 1
        const newCost = current.cost + moveCost + extraCost

        const newKey = getKey(newPosition, direction)

        if (!visited.has(newKey)) {
          pq.enqueue({ position: newPosition, cost: newCost, direction: direction }, newCost)
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

function reconstructPath(goal: DijkstraNode, parentMap: Map<string, DijkstraNode>): DijkstraNode[] {
  const path: DijkstraNode[] = []
  path.push(goal)

  let currentKey = getKey(goal.position, goal.direction)

  while (parentMap.has(currentKey)) {
    const current = parentMap.get(currentKey)
    if (current !== undefined) {
      path.push(current)
      currentKey = getKey(current.position, current.direction)
    }
  }

  return path.reverse()
}
