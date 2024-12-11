import select from '@inquirer/select'
import kleur from 'kleur'
import 'mac-ca/register' // b/c ZScaler cert is not in node CA
import { RunParams } from 'utils/dataTypes/index.js'
import { getSessionId } from './readWrite.js'

const baseUrl = 'https://adventofcode.com'

// private

const pickExampleBlock = async (examples: string[]): Promise<string> => {
  const choices = examples.map((example: string, index: number) => {
    return {
      name: (index + 1).toFixed(),
      value: index,
      description: example,
    }
  })

  choices.push({
    name: 'Cancel',
    value: -1,
    description: '',
  })

  const answer = await select({
    message: kleur.cyan('Select the desired test input from the day’s page'),
    choices: choices,
  })

  return examples[answer]
}

const getRequestHeaders = (): RequestInit => {
  return {
    method: 'GET',
    headers: {
      Cookie: `session=${getSessionId()}`,
    },
  }
}

// public

export const downloadExample = async ({ day, year }: RunParams): Promise<string> => {
  let input = ''

  try {
    const response = await fetch(`${baseUrl}/${year}/day/${day}`, getRequestHeaders())

    const htmlString = await response.text()
    const codeBlocks = htmlString.match(/<pre>[\s\S]+?<\/pre>/g)

    if (codeBlocks !== null) {
      for (let index = 0; index < codeBlocks.length; ++index) {
        codeBlocks[index] = codeBlocks[index].replace(/<\/?[a-z]+?>/g, '')
      }

      input = await pickExampleBlock(codeBlocks)
    }
  } catch (error) {
    console.error(error)
  }

  return input
}

export const downloadInput = async ({ day, year }: RunParams): Promise<string> => {
  let input = ''

  try {
    const response = await fetch(`${baseUrl}/${year}/day/${day}/input`, getRequestHeaders())

    input = await response.text()
  } catch (error) {
    console.error(error)
  }

  return input
}
