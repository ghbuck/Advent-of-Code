import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface MachineInfo {
  a: Point
  b: Point
  prizePoint: Point
}

/**
 * Thanks to my colleague [rjwut](https://github.com/rjwut) for his fine documentation
 * on linear algebra:
 *
 * Ax_a + Bx_b = x_p
 *
 * Ay_a + By_b = y_p
 *
 * 1. Solve both equations for A
 * 2. Set them equal to each other.
 * 3. Solve the result for B
 * 4. Plug in the values and compute B
 * 5. Pick either of the equations solved for A, and plugin in the values and the answer for B to get A
 */
const calculateLowestCostForPrizes = (machineInfo: MachineInfo[], prizeLocationAdjuster = 0): number => {
  let totalCost = 0

  const aPushCost = 3
  const bPushCost = 1

  for (const info of machineInfo) {
    const prizeLocation: Point = {
      x: info.prizePoint.x + prizeLocationAdjuster,
      y: info.prizePoint.y + prizeLocationAdjuster,
    }

    const bPushes = (info.a.x * prizeLocation.y - info.a.y * prizeLocation.x) / (info.a.x * info.b.y - info.a.y * info.b.x)
    const aPushes = (prizeLocation.x - bPushes * info.b.x) / info.a.x

    if (Number.isInteger(aPushes) && Number.isInteger(bPushes)) {
      totalCost += aPushCost * aPushes + bPushCost * bPushes
    }
  }

  return totalCost
}

const getInputObject = (inputString: string): MachineInfo[] => {
  return inputString.split('\n\n').map((data: string): MachineInfo => {
    const buttonA = data
      .match(/Button A: X\+(\d+), Y\+(\d+)/)
      ?.slice(1, 3)
      .map(Number)
    const buttonB = data
      .match(/Button B: X\+(\d+), Y\+(\d+)/)
      ?.slice(1, 3)
      .map(Number)
    const prize = data
      .match(/Prize: X=(\d+), Y=(\d+)/)
      ?.slice(1, 3)
      .map(Number)

    return {
      a: { x: buttonA?.[0] ?? 0, y: buttonA?.[1] ?? 0 },
      b: { x: buttonB?.[0] ?? 0, y: buttonB?.[1] ?? 0 },
      prizePoint: { x: prize?.[0] ?? 0, y: prize?.[1] ?? 0 },
    }
  })
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 480 : 26810,
    part2: params.isTest ? undefined : undefined,
  }

  const inputString = await getInput(params)
  const input = getInputObject(inputString)

  printAnswers({
    params,
    answer1: calculateLowestCostForPrizes(input),
    answer2: calculateLowestCostForPrizes(input, 10000000000000),
    solution,
  })
}
