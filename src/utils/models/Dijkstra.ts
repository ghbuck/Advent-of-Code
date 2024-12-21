import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'
import isEqual from 'lodash.isequal'
import { cardinalDirections, Point, tokenDirections } from 'utils/dataTypes/index.js'
import { isBetweenInclusive } from 'utils/maths/comparisons.js'
import { PriorityQueue } from 'utils/models/PriorityQueue.js'

interface DijkstraNode {
  position: Point
  cost: number
  direction?: Point
}

export interface DijkstraParams<T> {
  grid: T[][]
  startNode: Omit<DijkstraNode, 'cost'>
  goal: Point
  turnCost: number
  freeSpace: T
  endChar?: T
  doAnimation?: boolean
}

export interface DijkstraResults {
  path: Point[]
  cost: number
}

const getKey = (p: Point, dir?: Point) => {
  return dir ? `${p.x},${p.y},${dir.x},${dir.y}` : `${p.x},${p.y}`
}

export const runDijkstra = <T>({ grid, startNode, goal, turnCost, freeSpace, endChar, doAnimation }: DijkstraParams<T>): DijkstraResults[] => {
  const results: DijkstraResults[] = []

  const maxRowIndex = grid.length - 1
  const maxColIndex = grid[0].length - 1

  const visited = new Set<string>()
  const pq = new PriorityQueue<DijkstraNode>()
  const parentMap = new Map<string, DijkstraNode>()

  pq.enqueue({ ...startNode, cost: 0 }, 0)

  const loggingGrid = JSON.parse(JSON.stringify(grid)) as string[][]

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

      if (grid[newPosition.y][newPosition.x] === freeSpace || grid[newPosition.y][newPosition.x] === endChar) {
        const isTurn = current.direction && (current.direction.x !== direction.x || current.direction.y !== direction.y)
        const moveCost = 1 + (isTurn ? turnCost : 0)
        const newCost = current.cost + moveCost

        const newKey = getKey(newPosition, direction)

        if (!visited.has(newKey)) {
          pq.enqueue({ position: newPosition, cost: newCost, direction: direction }, newCost)
          parentMap.set(newKey, current)

          if (doAnimation) {
            loggingGrid[newPosition.y][newPosition.x] = tokenDirections.get(dirKey) ?? '.'
            process.stdout.write(clearScreen + kleur.cyan(loggingGrid.map((row: string[]) => row.join('')).join('\n')))

            const start = Date.now()
            let now = start
            while (now - start < 10) {
              now = Date.now()
            }
          }
        }
      }
    }
  }

  return results
}

function reconstructPath(goal: DijkstraNode, parentMap: Map<string, DijkstraNode>): Point[] {
  const path: Point[] = []
  let currentKey = getKey(goal.position, goal.direction)

  while (parentMap.has(currentKey)) {
    const current = parentMap.get(currentKey)
    if (current !== undefined) {
      path.push(current.position)
      currentKey = getKey(current.position, current.direction)
    }
  }

  path.push(goal.position)
  return path.reverse()
}
