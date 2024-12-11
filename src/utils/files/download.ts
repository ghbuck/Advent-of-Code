import select from '@inquirer/select'
import kleur from 'kleur'
import 'mac-ca/register' // b/c ZScaler cert is not in node CA
import { RunParams } from 'utils/dataTypes/index.js'
import { getSessionId } from './readWrite.js'

const baseUrl = 'https://adventofcode.com'

// private

interface ExampleBlockChoice {
  name: string
  value: number
  description: string
  isBestGuess: boolean
}

const pickExampleBlock = async (choices: ExampleBlockChoice[]): Promise<string> => {
  choices.push({
    name: 'Cancel',
    value: -1,
    description: '',
    isBestGuess: false,
  })

  const answer = await select({
    message: kleur.cyan('Select the desired test input from the day’s page\n\tThe first item is the assumed right choice\n\t(it follows a paragraph with the words ‘your puzzle input’)'),
    choices: choices,
  })

  if (answer === -1) {
    console.log(kleur.red('\nUser canceled out of test example selection.\n'))
    process.exit(1)
  }

  return choices[answer]?.description ?? ''
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
    const htmlSplitAtPre = htmlString.split('<pre>')

    if (codeBlocks !== null) {
      const exampleChoices: ExampleBlockChoice[] = []
      for (let index = 0; index < codeBlocks.length; ++index) {
        exampleChoices.push({
          name: String(index + 1),
          value: index,
          description: codeBlocks[index].replace(/<\/?[a-z]+?>/g, ''),
          isBestGuess: htmlSplitAtPre[index - 1]?.includes('your puzzle input'),
        })
      }

      input = await pickExampleBlock(exampleChoices)
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
