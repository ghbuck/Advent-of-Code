import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { Grid, RegionInfo, RegionResponse } from 'utils/models/Grid.js'
import { printAnswers } from 'utils/printing/index.js'

const getPlotMap = async (grid: Grid<string>, testValue?: string): Promise<RegionResponse<string>[]> => {
  const plotMap: RegionResponse<string>[] = []

  const uniquePlants = grid.getUniqueItems()
  for (const plant of uniquePlants) {
    if (testValue === undefined || (testValue !== undefined && plant === testValue)) {
      plotMap.push(await grid.findRegions(plant))
    }
  }

  return plotMap
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 1930 : 1461752,
    part2: params.isTest ? 1206 : 904114,
  }

  const input = await getInput(params)
  const grid = new Grid<string>({
    input,
    splitter1: '\n',
    splitter2: '',
    typeConstructor: String,
  })

  const plotMap = await getPlotMap(grid)
  const regions = plotMap.flatMap((data: RegionResponse<string>) => data.regions)

  printAnswers({
    params,
    answer1: regions.map((info: RegionInfo) => info.area * info.perimeter).reduce((total: number, current: number) => (total += current), 0),
    answer2: regions.map((info: RegionInfo) => info.area * info.sides).reduce((total: number, current: number) => (total += current), 0),
    solution,
  })
}
