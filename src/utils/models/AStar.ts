import { Point } from '@utils/dataTypes/index.js'

export interface AStarNode {
  x: number
  y: number
  f: number // Total cost (f = g + h)
  g: number // Cost from start to this node
  h: number // Heuristic cost to the goal
  parent: AStarNode | undefined
}

export interface AStarParams<T> {
  grid: T[][]
  start: Point
  goal: Point
  blockedSpace: string
}

// Heuristic function: Manhattan distance
const heuristic = (a: AStarNode, b: AStarNode): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// A* Algorithm
export const aStar = <T>({ grid, start, goal, blockedSpace }: AStarParams<T>): AStarNode[] => {
  const startNode = { x: start.x, y: start.y, f: 0, g: 0, h: 0, parent: undefined }
  const endNode = { x: goal.x, y: goal.y, f: 0, g: 0, h: 0, parent: undefined }

  const openSet: AStarNode[] = [startNode]
  const closedSet = new Set<string>()

  while (openSet.length > 0) {
    // Sort open set by lowest f value and pop the best node
    openSet.sort((a: AStarNode, b: AStarNode) => a.f - b.f)

    const current = openSet.shift()
    if (current === undefined) continue

    // If we reached the goal, reconstruct the path
    if (current.x === goal.x && current.y === goal.y) {
      const path: AStarNode[] = []

      let temp: AStarNode | undefined = current

      while (temp) {
        path.push(temp)
        temp = temp.parent
      }
      return path.reverse()
    }

    closedSet.add(`${current.x},${current.y}`)

    // Generate neighbors
    const neighbors: AStarNode[] = [
      { x: current.x + 1, y: current.y, f: 0, g: 0, h: 0, parent: undefined },
      { x: current.x - 1, y: current.y, f: 0, g: 0, h: 0, parent: undefined },
      { x: current.x, y: current.y + 1, f: 0, g: 0, h: 0, parent: undefined },
      { x: current.x, y: current.y - 1, f: 0, g: 0, h: 0, parent: undefined },
    ]

    for (const neighbor of neighbors) {
      // Skip if out of bounds or in closed set
      if (
        neighbor.x < 0 ||
        neighbor.y < 0 ||
        neighbor.x >= grid[0].length ||
        neighbor.y >= grid.length ||
        grid[neighbor.x][neighbor.y] === blockedSpace ||
        closedSet.has(`${neighbor.x},${neighbor.y}`)
      ) {
        continue
      }

      // Calculate g, h, and f
      neighbor.g = current.g + 1
      neighbor.h = heuristic(neighbor, endNode)
      neighbor.f = neighbor.g + neighbor.h
      neighbor.parent = current

      // If already in openSet with a lower f value, skip
      const existing = openSet.find((node: AStarNode) => node.x === neighbor.x && node.y === neighbor.y)
      if (existing && existing.f <= neighbor.f) {
        continue
      }

      openSet.push(neighbor)
    }
  }

  // No path found
  return []
}
