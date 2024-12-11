import kleur from 'kleur'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { RunParams } from 'utils/dataTypes/index.js'
import { downloadExample, downloadInput } from 'utils/files/download.js'

const sessionIdPath = resolve('.', 'input', 'sessionId.txt')

export const getSessionId = (): string => {
  return readFileSync(sessionIdPath).toString()
}

export const setSessionId = (sessionId: string) => {
  writeFileSync(sessionIdPath, sessionId)
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
  const filename = `${params.day}${params.isTest ? '_example' : ''}.txt`
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
    throw new Error(kleur.red(`Unable to download or read from cache the input for ${params.year} day ${params.day}`))
  }

  return input
}
