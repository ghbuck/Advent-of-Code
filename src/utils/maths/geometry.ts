import { Point, Point3D } from '@utils/dataTypes/index.js'

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
export const distanceBetweenPoints = (a: Point & Partial<Point3D>, b: Point & Partial<Point3D>): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z ?? 0) - (b.z ?? 0)

  return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2)
}

export const getManhattanDistance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
