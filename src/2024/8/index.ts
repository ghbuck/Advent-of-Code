import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { isBetweenInclusive } from 'utils/maths/index.js'
import { printAnswers } from 'utils/printing/index.js'

type NodeMap = Map<string, Point[]>

const inBounds = (point: Point, maxPoint: Point): boolean => isBetweenInclusive(point.x, 0, maxPoint.x) && isBetweenInclusive(point.y, 0, maxPoint.y)

const getNodeMap = (map: string[][], maxPoint: Point): NodeMap => {
  const nodeMap: NodeMap = new Map<string, Point[]>()

  for (let rowIndex = 0; rowIndex <= maxPoint.y; ++rowIndex) {
    for (let colIndex = 0; colIndex <= maxPoint.x; ++colIndex) {
      const item = map[rowIndex][colIndex]

      if (item !== '.') {
        const info = nodeMap.get(item) ?? []
        info.push({ x: colIndex, y: rowIndex })
        nodeMap.set(item, info)
      }
    }
  }

  return nodeMap
}

const findAntinodes = (nodeMap: NodeMap, maxPoint: Point): Set<string> => {
  const antinodes = new Set<string>()

  nodeMap.forEach((points: Point[]) => {
    for (let p1Index = 0; p1Index < points.length; ++p1Index) {
      const point1 = points[p1Index]

      for (let p2Index = 0; p2Index < points.length; ++p2Index) {
        if (p1Index === p2Index) continue

        const point2 = points[p2Index]
        const antinode = {
          x: point2.x + (point2.x - point1.x),
          y: point2.y + (point2.y - point1.y),
        }

        if (inBounds(antinode, maxPoint)) {
          antinodes.add(`${antinode.x},${antinode.y}`)
        }
      }
    }
  })

  return antinodes
}

const findAllAntinodes = (nodeMap: NodeMap, maxPoint: Point): Set<string> => {
  const antinodes = new Set<string>()

  nodeMap.forEach((points: Point[]) => {
    for (let p1Index = 0; p1Index < points.length; ++p1Index) {
      const point1 = points[p1Index]

      for (let p2Index = 0; p2Index < points.length; ++p2Index) {
        if (p1Index === p2Index) continue

        const point2 = points[p2Index]
        const deltas = {
          x: point2.x - point1.x,
          y: point2.y - point1.y,
        }

        let antinode = point2
        do {
          antinodes.add(`${antinode.x},${antinode.y}`)
          antinode = {
            x: antinode.x + deltas.x,
            y: antinode.y + deltas.y,
          }
        } while (inBounds(antinode, maxPoint))
      }
    }
  })

  return antinodes
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 14 : 313,
    part2: params.isTest ? 34 : undefined,
  }

  const input = await getInput(params)
  const map = input.split('\n').map((row: string) => row.split(''))

  const mapSize: Point = {
    x: map[0].length - 1,
    y: map.length - 1,
  }

  const nodeMap = getNodeMap(map, mapSize)
  const someAntinodes = findAntinodes(nodeMap, mapSize)
  const allAntinodes = findAllAntinodes(nodeMap, mapSize)

  printAnswers({
    params,
    answer1: someAntinodes.size,
    answer2: allAntinodes.size,
    solution,
  })
}
