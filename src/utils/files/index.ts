import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RunParams } from 'utils/dataTypes/index.js'

export const getInput = (params: RunParams) => {
  const filename = params.isTest ? 'testInput.txt' : 'input.txt'
  const path = resolve('.', 'src', `${params.year}`, `${params.day}`, filename)

  return readFileSync(path).toString().trim()
}
