import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface IterationInfo {
  iterationIndex: number
  code: number
  price: number
  priceChange: number
  priceChangeHistory: number[]
}

interface CodeInfo {
  finalValue: number
  info: IterationInfo[]
  maxPrice: number
}

const parseInput = (input: string): number[] => {
  return input.split('\n').map(Number)
}

const mix = (originalValue: number, newValue: number): number => originalValue ^ newValue
const prune = (value: number): number => value & 0xffffff

/**
 * Originally had:
 *
 * const step1 = prune(mix(prevSecretNumber, prevSecretNumber * 64))
 * const step2 = prune(mix(step1, BigInt((step1 / 32).toString().replace(/\..+/, ''))))
 * const step3 = prune(mix(step2, step2 * 2048))
 *
 * but found out that we can convert the arithmetic operations to bitwise operations
 *
 * same with the prune function above:
 *
 * value % 16777216
 */
const calculateNextSecretNumber = (prevSecretNumber: number): number => {
  const step1 = prune(mix(prevSecretNumber, prevSecretNumber << 6))
  const step2 = prune(mix(step1, step1 >> 5))
  const step3 = prune(mix(step2, step2 << 11))

  return step3
}

const calculateValues = (secretCodes: number[]): CodeInfo[] => {
  const maxIteration = 2000
  const calculatedValues: CodeInfo[] = []

  for (let code of secretCodes) {
    const info: IterationInfo[] = []
    for (let iterationIndex = 0; iterationIndex < maxIteration; ++iterationIndex) {
      code = calculateNextSecretNumber(code)

      let priceChange = 0
      let priceChangeHistory: number[] = []

      const price = Number(code.toString().slice(-1))
      const prevInfo = info[iterationIndex - 1]
      if (prevInfo !== undefined) {
        priceChange = price - prevInfo.price
        priceChangeHistory = [...prevInfo.priceChangeHistory.slice(-3), priceChange]
      }

      info.push({ iterationIndex, code, price, priceChange, priceChangeHistory })
    }

    calculatedValues.push({
      finalValue: code,
      info,
      maxPrice: Math.max(...info.map(({ price }) => price)),
    })
  }

  return calculatedValues
}

const calculateMaximalBananas = (calculatedValues: CodeInfo[]): number => {
  const bananaMap = new Map<string, number>()
  calculatedValues.forEach(({ info }) => {
    const localBananas = new Set<string>()

    for (const { priceChangeHistory, price } of info) {
      if (priceChangeHistory.length < 4) continue

      const key = priceChangeHistory.join(',')

      if (!localBananas.has(key)) {
        localBananas.add(key)
        bananaMap.set(key, (bananaMap.get(key) ?? 0) + price)
      }
    }
  })

  return Math.max(...bananaMap.values())
}

/**
 * N.B.: The example used two different inputs. `22_example_1.txt` and `22_example_2.txt`.
 *  Remove the `_[12]` to run the appropriate input.
 */
export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 37327623 : 19877757850,
    part2: params.isTest ? 23 : undefined,
  }

  const secretCodes = parseInput(await getInput(params))
  const calculatedValues = calculateValues(secretCodes)
  const maximalBananas = calculateMaximalBananas(calculatedValues)

  printAnswers({
    params,
    answer1: calculatedValues.map(({ finalValue }: CodeInfo) => finalValue).reduce((total: number, current: number) => total + current, 0),
    answer2: maximalBananas,
    solution,
  })
}
