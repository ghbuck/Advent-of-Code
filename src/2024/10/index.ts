import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface PathInfo {
  endpoints: Set<string>
  rating: number
}

interface PathValuation {
  score: number
  rating: number
}

const followPath = async (value: number, endValue: number, point: Point, map: number[][]): Promise<PathInfo> => {
  const pathInfo: PathInfo = {
    endpoints: new Set<string>(),
    rating: 0,
  }

  const nextValue = value + 1
  const nextOptions: Point[] = [
    {
      x: point.x,
      y: point.y - 1,
    },
    {
      x: point.x + 1,
      y: point.y,
    },
    {
      x: point.x,
      y: point.y + 1,
    },
    {
      x: point.x - 1,
      y: point.y,
    },
  ].filter((option: Point) => map[option.y]?.[option.x] === nextValue)

  if (nextValue === endValue) {
    pathInfo.rating = nextOptions.length
    for (const option of nextOptions) {
      pathInfo.endpoints.add(`${option.x},${option.y}`)
    }
  } else {
    for (const option of nextOptions) {
      const furtherDownThePathInfo = await followPath(nextValue, endValue, option, map)

      pathInfo.rating += furtherDownThePathInfo.rating
      for (const option of furtherDownThePathInfo.endpoints) {
        pathInfo.endpoints.add(option)
      }
    }
  }

  return pathInfo
}

const evaluateTrails = async (map: number[][], trailEnd: number): Promise<PathValuation> => {
  const zeros: Point[] = []

  for (let rowIndex = 0; rowIndex < map.length; ++rowIndex) {
    const row = map[rowIndex]

    for (let colIndex = 0; colIndex < row.length; ++colIndex) {
      const col = row[colIndex]

      if (col === 0) {
        zeros.push({ x: colIndex, y: rowIndex })
      }
    }
  }

  return Promise.all(zeros.map((point: Point) => followPath(0, trailEnd, point, map))).then((values: PathInfo[]) => {
    return {
      score: values.reduce((total: number, current: PathInfo) => (total += current.endpoints.size), 0),
      rating: values.reduce((total: number, current: PathInfo) => (total += current.rating), 0),
    }
  })
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 36 : 459,
    part2: params.isTest ? 81 : 1034,
  }

  const input = await getInput(params)
  const inputArray = input.split('\n').map((row: string) => row.split('').map(Number))

  const trailValues = await evaluateTrails(inputArray, 9)

  printAnswers({
    params,
    answer1: trailValues.score,
    answer2: trailValues.rating,
    solution,
  })
}
