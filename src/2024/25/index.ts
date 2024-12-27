import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

type Lock = [number, number, number, number, number]
type Key = [number, number, number, number, number]

interface ParseInfo {
  locks: Lock[]
  keys: Key[]
}

const parseInput = (input: string): ParseInfo => {
  const info: ParseInfo = { locks: [], keys: [] }

  input.split('\n\n').forEach((item: string) => {
    const grid = item.split('\n')
    const height = grid.length

    const values: number[] = []
    for (let colIndex = 0; colIndex < grid[0].length; ++colIndex) {
      const col = grid.map((row: string) => row[colIndex])
      const numPounds = col.filter((char: string) => char === '#').length
      values.push(numPounds)
    }

    if (grid[0][0] === '#') {
      info.locks.push(values.map((x: number) => -(height - x)) as Lock)
    } else {
      info.keys.push(values as Key)
    }
  })

  return info
}

const findLockAndKeyFits = ({ locks, keys }: ParseInfo): number => {
  let numFits = 0

  for (const lock of locks) {
    for (const key of keys) {
      const itFits = lock.every((pin, index) => pin + key[index] <= 0)
      if (itFits) {
        numFits++
      }
    }
  }

  return numFits
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 3 : 3291,
    part2: params.isTest ? undefined : undefined,
  }

  const locksAndKeys = parseInput(await getInput(params))
  const numberOfFits = findLockAndKeyFits(locksAndKeys)

  printAnswers({
    params,
    answer1: numberOfFits,
    answer2: undefined,
    solution,
  })
}
