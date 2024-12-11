import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface NodeInfo {
  nodes: Point[]
  antinodes: Point[]
}

type NodeMap = Map<string, NodeInfo>

const findAntinodes = (input: string[][]): number => {
  const inputSize: Point = {
    x: input[0].length,
    y: input.length,
  }

  const nodeMap: NodeMap = new Map<string, NodeInfo>()
  for (let rowIndex = 0; rowIndex < inputSize.y; ++rowIndex) {
    for (let colIndex = 0; colIndex < inputSize.x; ++colIndex) {
      const item = input[rowIndex][colIndex]

      if (item !== '.') {
        const info = nodeMap.get(item) ?? {
          nodes: [],
          antinodes: [],
        }

        if (nodeMap.get(item) === undefined) {
          nodeMap.set(item, info)
        }

        info?.nodes.push({
          x: colIndex,
          y: rowIndex,
        })
      }
    }
  }

  console.log(nodeMap)

  return 0
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 14 : undefined,
    part2: params.isTest ? undefined : undefined,
  }

  const input = await getInput(params)
  const inputArray = input.split('\n').map((row: string) => row.split(''))

  const nodeMap = findAntinodes(inputArray)

  printAnswers({
    params,
    answer1: nodeMap,
    answer2: undefined,
    solution,
  })
}
