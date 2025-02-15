import { Point } from '@utils/dataTypes/index.js'

export const findFourthPoint = (p1: Point, p2: Point, p3: Point): Point => {
  const midpoint = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }

  const p4 = {
    x: 2 * midpoint.x - p3.x,
    y: 2 * midpoint.y - p3.y,
  }

  return p4
}

// Helper to calculate distance between two points
export const distanceBetweenPoints = (a: Point, b: Point): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export const getManhattanDistance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
