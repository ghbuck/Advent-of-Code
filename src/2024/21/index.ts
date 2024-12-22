import { directionToToken, Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { DijkstraNode, DijkstraResults, runDijkstra } from 'utils/models/Dijkstra.js'
import { printAnswers } from 'utils/printing/index.js'

interface SequenceResult {
  code: string
  sequence: string
}

const keypad = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['null', '0', 'A'],
]

const dirpad = [
  ['null', '^', 'A'],
  ['<', 'v', '>'],
]

const findKeyPoint = (grid: string[][], key: string): Point | undefined => {
  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, col] of row.entries()) {
      if (col === key) {
        return { x: colIndex, y: rowIndex }
      }
    }
  }
}

const findShortestPath = (grid: string[][], start: Point | undefined, end: Point | undefined): DijkstraResults | undefined => {
  if (start !== undefined && end !== undefined) {
    const step = runDijkstra<string>({
      grid,
      startNode: { position: start },
      goal: end,
      blockedSpace: 'null',
    })

    const minCost = Math.min(...step.map(({ cost }: DijkstraResults) => cost))
    const shortestPath = step.filter(({ cost }: DijkstraResults) => cost === minCost).shift()
    if (shortestPath !== undefined) {
      shortestPath.path = shortestPath.path.filter(({ direction }: DijkstraNode) => direction !== undefined)
      return shortestPath
    }
  }
}

const findOptimalKeypadSequence = (parts: string[], pad: string[][]): string[] => {
  const keystrokes: string[][] = []

  let startKey = 'A'

  for (const key of parts) {
    const start = findKeyPoint(pad, startKey)
    const end = findKeyPoint(pad, key)
    const shortestPath = findShortestPath(pad, start, end)

    if (shortestPath !== undefined) {
      const pathTokens = shortestPath.path.map(({ direction }: DijkstraNode) => directionToToken(direction))
      keystrokes.push([...pathTokens, 'A'])
    }

    startKey = key
  }

  return keystrokes.flat()
}

const getCodeSequence = (code: string): SequenceResult => {
  const codeParts = code.split('')
  const sequence: string[][] = []

  sequence.push(findOptimalKeypadSequence(codeParts, keypad))

  const numDirpads = 2
  for (let padIndex = 0; padIndex < numDirpads; padIndex++) {
    const prevTaps = sequence[padIndex]
    sequence.push(findOptimalKeypadSequence(prevTaps, dirpad))
  }

  return {
    code,
    sequence: sequence.pop()?.join('') ?? '',
  }
}

const calcComplexity = (code: string, sequence: string): number => sequence.length * Number(code.replaceAll(/[A-Za-z]+/g, ''))

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 126384 : undefined,
    part2: params.isTest ? undefined : undefined,
  }

  const sequences: SequenceResult[] = []

  const codes = (await getInput(params)).split('\n')

  for (const code of codes) {
    sequences.push(getCodeSequence(code))
  }

  for (const { code, sequence } of sequences) {
    console.log({
      code,
      sequence,
      length: sequence.length,
    })
  }

  printAnswers({
    params,
    answer1: sequences.map(({ code, sequence }: SequenceResult) => calcComplexity(code, sequence)).reduce((total: number, current: number) => (total += current), 0),
    answer2: undefined,
    solution,
  })
}
