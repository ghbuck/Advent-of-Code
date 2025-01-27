import { RunParams } from '@utils/dataTypes/index.js'
import { downloadExample, downloadInput } from '@utils/files/download.js'

import kleur from 'kleur'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sessionIdPath = resolve('.', 'input', 'sessionId.txt')
const lastRequestTimestampPath = resolve('.', 'input', 'lastRequestTimestamp.txt')

export const getSessionId = (): string => {
  return readFileSync(sessionIdPath).toString()
}

export const setSessionId = (sessionId: string) => {
  writeFileSync(sessionIdPath, sessionId)
}

export const getLastRequestTimestamp = (): number => {
  try {
    return Number(readFileSync(lastRequestTimestampPath).toString())
  } catch {
    return NaN
  }
}

export const setLastRequestTimestamp = (timestamp: number) => {
  writeFileSync(lastRequestTimestampPath, `${timestamp}`)
}

export const createNewDay = async (params: RunParams) => {
  const inputFolder = resolve('.', 'input', `${params.year}`)
  const dayFolder = resolve('.', 'src', `${params.year}`, `${params.day}`)

  const sourceFilePath = resolve('.', 'src', 'utils', 'template', 'index.ts')
  const newFilePath = resolve(dayFolder, 'index.ts')
  const inputFiles = [resolve(inputFolder, `${params.day}.txt`), resolve(inputFolder, `${params.day}_example.txt`)]

  if (!existsSync(dayFolder)) {
    console.log(kleur.cyan(`Creating ${dayFolder}`))
    mkdirSync(dayFolder)
  }

  if (!existsSync(`${dayFolder}/index.ts`)) {
    console.log(kleur.cyan(`Creating ${newFilePath}`))
    copyFileSync(sourceFilePath, newFilePath)
  }

  for (const filePath of inputFiles) {
    if (!existsSync(filePath)) {
      let input = ''

      if (filePath.endsWith('_example.txt')) {
        console.log(kleur.cyan(`Creating the example input file`))
        input = await downloadExample(params)
      } else {
        console.log(kleur.cyan(`Creating the main input file`))
        input = await downloadInput(params)
      }

      writeFileSync(filePath, input)
    }
  }

  console.log(kleur.green(`\n${params.year}, day ${params.day} is set up and ready to go!\n`))
}

export const getInput = async (params: RunParams): Promise<string> => {
  let testFilename = params.isTest ? '_example' : ''
  if (testFilename !== '' && params.testPart !== 0) {
    testFilename += `_${params.testPart}`
  }

  const filename = `${params.day}${testFilename}.txt`
  const path = resolve('.', 'input', `${params.year}`, filename)

  let input = ''

  try {
    input = readFileSync(path).toString().trim()
  } catch {
    if (params.isTest) {
      input = await downloadExample(params)
    } else {
      input = await downloadInput(params)
    }

    writeFileSync(path, input)
  }

  if (input === undefined || input === '') {
    console.log(kleur.red(`Unable to download or read from cache the input for ${params.year} day ${params.day}`))
    process.exit(1)
  }

  return input
}
