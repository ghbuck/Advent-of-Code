import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface BoxDimensions {
  length: number
  width: number
  height: number
}

const parseInput = (input: string): BoxDimensions[] => {
  return input.split('\n').map((line: string) => {
    const parts = line.split('x')
    return {
      length: Number(parts[0]),
      width: Number(parts[1]),
      height: Number(parts[2]),
    }
  })
}

const getWrappingPaperArea = (box: BoxDimensions): number => {
  const area1 = box.length * box.width
  const area2 = box.width * box.height
  const area3 = box.height * box.length

  const baseArea = 2 * area1 + 2 * area2 + 2 * area3
  const minArea = Math.min(area1, area2, area3)

  return baseArea + minArea
}

const getRibbonLength = (box: BoxDimensions): number => {
  const shortestDimensions = [box.length, box.width, box.height].sort((a, b) => a - b).slice(0, 2)
  const ribbonLength = 2 * (shortestDimensions[0] + shortestDimensions[1])

  return ribbonLength + box.length * box.width * box.height
}

const getSupplyTotals = (boxes: BoxDimensions[]): [number, number] => {
  let totalWrappingPaperArea = 0
  let totalRibbonLength = 0

  for (const box of boxes) {
    totalWrappingPaperArea += getWrappingPaperArea(box)
    totalRibbonLength += getRibbonLength(box)
  }

  return [totalWrappingPaperArea, totalRibbonLength]
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 1586300,
    part2: params.isTest ? undefined : 3737498,
  }

  const input = parseInput(await getInput(params))

  const [answer1, answer2] = getSupplyTotals(input)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? answer1 : undefined,
    answer2: params.part === 'all' || params.part === 2 ? answer2 : undefined,
    solution,
  })
}
