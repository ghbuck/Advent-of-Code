import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): string[] => {
  return input.split('')
}

const visitHouse = (direction: string, x: number, y: number, visited: Set<string>): [number, number] => {
  switch (direction) {
    case '^':
      y += 1
      break
    case 'v':
      y -= 1
      break
    case '>':
      x += 1
      break
    case '<':
      x -= 1
      break
  }

  visited.add(`${x},${y}`)

  return [x, y]
}

const part1Answer = (directions: string[]): number => {
  const visited = new Set<string>()
  let x = 0
  let y = 0

  visited.add(`${x},${y}`)

  for (const direction of directions) {
    ;[x, y] = visitHouse(direction, x, y, visited)
  }

  return visited.size
}

const part2Answer = (directions: string[]): number => {
  const santaVisited = new Set<string>()
  const roboVisited = new Set<string>()

  let realSantaX = 0
  let realSantaY = 0
  let roboSantaX = 0
  let roboSantaY = 0

  santaVisited.add(`${realSantaX},${realSantaY}`)
  roboVisited.add(`${roboSantaX},${roboSantaY}`)

  for (const [index, direction] of directions.entries()) {
    if (index % 2 === 0) {
      ;[realSantaX, realSantaY] = visitHouse(direction, realSantaX, realSantaY, santaVisited)
    } else {
      ;[roboSantaX, roboSantaY] = visitHouse(direction, roboSantaX, roboSantaY, roboVisited)
    }
  }

  return santaVisited.union(roboVisited).size
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? undefined : 2592,
    part2: params.isTest ? undefined : 2360,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer(input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer(input) : undefined,
    solution,
  })
}
