import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

class StoneCounter extends Map<number, number> {
  add(key: number, newValue: number) {
    this.set(key, (this.get(key) ?? 0) + newValue)
  }
  count(): number {
    return [...this.values()].reduce((total: number, current: number) => (total += current), 0)
  }
}

const blinkXTimes = (stones: number[], maxBlinkNumber: number): number => {
  let stoneCounter = new StoneCounter()
  stones.map((stone: number) => stoneCounter.add(stone, 1))

  for (let blink = 0; blink < maxBlinkNumber; ++blink) {
    const oldStones: [number, number][] = [...stoneCounter.entries()]
    stoneCounter = new StoneCounter()

    for (const [stone, stoneCount] of oldStones) {
      const stoneString = String(stone)

      if (stone === 0) {
        stoneCounter.add(1, stoneCount)
      } else if (stoneString.length % 2 === 0) {
        const midpoint = stoneString.length / 2

        stoneCounter.add(Number(stoneString.substring(0, midpoint)), stoneCount)
        stoneCounter.add(Number(stoneString.substring(midpoint)), stoneCount)
      } else {
        stoneCounter.add(stone * 2024, stoneCount)
      }
    }
  }

  return stoneCounter.count()
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 55312 : 213625,
    part2: params.isTest ? 65601038650482 : 252442982856820,
  }

  const inputString = await getInput(params)
  const inputArray = inputString.split(' ').map(Number)

  printAnswers({
    params,
    answer1: blinkXTimes(inputArray, 25),
    answer2: blinkXTimes(inputArray, 75),
    solution,
  })
}
