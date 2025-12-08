import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { Grid } from '@utils/models/Grid.js'
import { printAnswers } from '@utils/printing/index.js'

const splitter = '^'

const parseInput = (input: string): Grid<string> => {
  return new Grid({
    input,
    splitter1: '\n',
    splitter2: '',
    typeConstructor: String,
  })
}

const setRowBeam = (rowBeams: Map<number, number>, xIndex: number, count: number) => {
  rowBeams.set(xIndex, (rowBeams.get(xIndex) ?? 0) + count)
}

const processBeams = (grid: Grid<string>): [number, number] => {
  let splitCount = 0

  const maxYIndex = grid.getRowCount() - 1

  const startingPoint = grid.findPoint('S')
  if (!startingPoint) throw new Error('No starting point found')

  const splitterPoints = grid.findPoints(splitter).map((point) => `${point.x},${point.y}`)
  const splitters = new Set<string>(splitterPoints)

  let beams = new Map<number, number>([[startingPoint.x, 1]])
  for (let yIndex = startingPoint.y + 1; yIndex < maxYIndex; yIndex++) {
    const rowBeams = new Map<number, number>()

    for (const [xIndex, count] of beams) {
      if (splitters.has(`${xIndex},${yIndex}`)) {
        splitCount++

        const leftBeam = xIndex - 1
        const rightBeam = xIndex + 1

        setRowBeam(rowBeams, leftBeam, count)
        setRowBeam(rowBeams, rightBeam, count)
      } else {
        setRowBeam(rowBeams, xIndex, count)
      }
    }

    beams = rowBeams
  }

  return [splitCount, beams.values().reduce((a, b) => a + b, 0)]
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 21 : 1560,
    part2: params.isTest ? 40 : 25592971184998,
  }

  const grid = parseInput(await getInput(params))
  const [part1Answer, part2Answer] = processBeams(grid)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer : undefined,
    solution,
  })
}
