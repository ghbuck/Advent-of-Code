import { Edge, Point, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { getPolygonEdges } from '@utils/maths/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface Answers {
  part1: number
  part2: number
}

const parseInput = (input: string): Point[] => {
  return input
    .split('\n')
    .map((line: string) => line.split(','))
    .map((arr: string[]): Point => ({ x: Number(arr[0]), y: Number(arr[1]) }))
}

const getRectEdges = (p1: Point, p2: Point): Edge[] => {
  const minX = Math.min(p1.x, p2.x) + 0.1
  const maxX = Math.max(p1.x, p2.x) - 0.1
  const minY = Math.min(p1.y, p2.y) + 0.1
  const maxY = Math.max(p1.y, p2.y) - 0.1

  return getPolygonEdges([
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ])
}

const isInsideRange = (value: number, num1: number, num2: number): boolean => {
  const min = Math.min(num1, num2)
  const max = Math.max(num1, num2)

  return value > min && value < max
}

const edgesDoNotIntersect = (edge: Edge, mainEdges: Edge[]): boolean => {
  for (const mainEdge of mainEdges) {
    if (edge.slope === mainEdge.slope) continue

    if (edge.slope === 'horizontal') {
      if (!isInsideRange(edge.start.y, mainEdge.start.y, mainEdge.end.y)) continue
      if (!isInsideRange(mainEdge.start.x, edge.start.x, edge.end.x)) continue
      return false
    } else if (edge.slope === 'vertical') {
      if (!isInsideRange(edge.start.x, mainEdge.start.x, mainEdge.end.x)) continue
      if (!isInsideRange(mainEdge.start.y, edge.start.y, edge.end.y)) continue
      return false
    }
  }

  return true
}

const isRectangleInBounds = (p1: Point, p2: Point, mainEdges: Edge[]): boolean => {
  const rectEdges = getRectEdges(p1, p2)

  for (const edge of rectEdges) {
    if (edgesDoNotIntersect(edge, mainEdges)) continue
    return false
  }

  return true
}

const findMaximalAreas = (coordinates: Point[]): Answers => {
  const mainEdges = getPolygonEdges(coordinates)

  let maxArea = 0
  let maxBoundedArea = 0

  // Try each pair of coordinates as potential opposite corners
  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      const point1 = coordinates[i]
      const point2 = coordinates[j]

      // Skip lines
      if (point1.x === point2.x || point1.y === point2.y) continue

      // Part 1
      const area = (Math.abs(point2.x - point1.x) + 1) * (Math.abs(point2.y - point1.y) + 1)
      maxArea = Math.max(maxArea, area)

      // Part 2
      if (isRectangleInBounds(point1, point2, mainEdges)) {
        maxBoundedArea = Math.max(maxBoundedArea, area)
      }
    }
  }

  return {
    part1: maxArea,
    part2: maxBoundedArea,
  }
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 50 : 4749929916,
    part2: params.isTest ? 24 : 1572047142,
  }

  const coordinates = parseInput(await getInput(params))
  const answers = findMaximalAreas(coordinates)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? answers.part1 : undefined,
    answer2: params.part === 'all' || params.part === 2 ? answers.part2 : undefined,
    solution,
  })
}
