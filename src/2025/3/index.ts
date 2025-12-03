import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInput = (input: string): number[][] => {
  const baseArray = input.split('\n').map((line: string) => line.split('').map((char) => Number(char)))
  return baseArray
}

const calcMaxJoltage = (powerBanks: number[][], numBatteriesToSave: number): number => {
  // We're going to use two nested reduces here.
  // The outer reduce will iterate over each power bank (array of batteries)
  // The inner reduce will iterate over each battery in the current power bank
  // and build an array of the highest joltages we can save based on the number
  // of batteries we are allowed to save.
  return powerBanks.reduce((total, bank) => {
    const maxBankIndex = bank.length - 1

    const bankMaxValues: number[] = bank.reduce((savedBatteries, currentBattery, index) => {
      const numRemainingBatteries = maxBankIndex - index

      // Make sure we have enough remaining batteries to fill our saved batteries array
      // As long as numBatteriesToSave is less than numRemainingBatteries, we start at 0
      // Subtract to get the correct starting index to check against
      let checkIndex = Math.max(0, numBatteriesToSave - numRemainingBatteries - 1)

      for (checkIndex; checkIndex < savedBatteries.length; checkIndex++) {
        // If the current battery is greater than the saved battery at the check index,
        // we replace it and any subsequent batteries with the current battery and 0s
        if (currentBattery > savedBatteries[checkIndex]) {
          const numberToRemove = numBatteriesToSave - checkIndex
          const replaceArray = [currentBattery, ...Array<number>(numberToRemove - 1).fill(0)]

          savedBatteries.splice(checkIndex, numberToRemove, ...replaceArray)

          break
        }
      }

      return savedBatteries
    }, Array<number>(numBatteriesToSave).fill(0))

    // Sum the selected battery joltages from this bank and add to the total
    return total + Number(bankMaxValues.join(''))
  }, 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 357 : 16887,
    part2: params.isTest ? 3121910778619 : 167302518850275,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? calcMaxJoltage(input, 2) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? calcMaxJoltage(input, 12) : undefined,
    solution,
  })
}
