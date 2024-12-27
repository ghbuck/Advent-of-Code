import select from '@inquirer/select'
import kleur from 'kleur'
import 'mac-ca/register' // b/c ZScaler cert is not in node CA
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { RunParams } from 'utils/dataTypes/index.js'
import { getSessionId } from './readWrite.js'
import { resolve } from 'node:path'
import { cursorBackward, cursorLeft, eraseStartLine } from 'ansi-escapes'

const baseUrl = 'https://adventofcode.com'
const userAgent = 'github.com/ghbuck/Advent-of-Code ; contact @ https://github.com/ghbuck/Advent-of-Code/issues/new'

//#region private

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
      'User-Agent': userAgent,
    },
  }
}

const parseHtmlStringForReadme = (day: number, year: number, htmlString: string) => {
  const readmePath = resolve('.', 'src', `${year}`, 'README.md')

  if (!existsSync(readmePath)) {
    let template = readFileSync(resolve('.', 'src', 'utils', 'template', 'README.md')).toString()
    template = template.replace('[YEAR]', `${year}`)
    writeFileSync(readmePath, template)
  }

  const readme = readFileSync(readmePath).toString()
  const readmeParts = readme.split(/^(?=## )/m).map((mainSection: string) => mainSection.split(/^(?=### )/m))
  const solutions = readmeParts[2]
  const existingDays = solutions.map((section: string) => Number(section.substring(section.indexOf('Day ') + 4, section.indexOf(':')))).filter((day: number) => !isNaN(day))

  const title = htmlString.match(/<h2>--- ?(Day \d+: .+?) ?---<\/h2>/)?.[1]
  if (title !== undefined && !existingDays.includes(day)) {
    const newBodyPart = `### [${title}](https://adventofcode.com/${year}/day/${day})\n\n` + '#### $\\textsf{\\color{red}{Part 1:}}$\n\n' + '#### $\\textsf{\\color{green}{Part 2:}}$\n\n'

    solutions.push(newBodyPart)
    solutions.sort((a: string, b: string) => {
      if (a.startsWith('## Solution')) {
        return -1
      } else if (b.startsWith('## Solution')) {
        return 1
      } else {
        const testA = Number(a.substring(a.indexOf('Day ') + 4, a.indexOf(':')))
        const testB = Number(b.substring(b.indexOf('Day ') + 4, b.indexOf(':')))
        return testA - testB
      }
    })

    console.log(kleur.cyan(`Updating the README.md file for day ${day}`))
    writeFileSync(readmePath, readmeParts.flatMap((part: string[]) => part.join('')).join(''))
  }
}

//#endregion

//#region public

export const downloadExample = async ({ day, year }: RunParams): Promise<string> => {
  let input = ''

  try {
    const response = await fetch(`${baseUrl}/${year}/day/${day}`, getRequestHeaders())
    const htmlString = await response.text()

    parseHtmlStringForReadme(day, year, htmlString)

    const codeBlocks = htmlString.match(/<pre>[\s\S]+?<\/pre>/g)
    const htmlSplitAtPre = htmlString.split('<pre>')

    if (codeBlocks !== null) {
      const exampleChoices: ExampleBlockChoice[] = []
      for (let index = 0; index < codeBlocks.length; ++index) {
        exampleChoices.push({
          name: String(index + 1),
          value: index,
          description: codeBlocks[index]
            .replace(/<\/?[a-z]+?>/g, '')
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>'),
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

export const catchUpReadmeSections = async (year: number): Promise<void> => {
  const readmePath = resolve('.', 'src', `${year}`, 'README.md')

  if (!existsSync(readmePath)) {
    let template = readFileSync(resolve('.', 'src', 'utils', 'template', 'README.md')).toString()
    template = template.replace('[YEAR]', `${year}`)
    writeFileSync(readmePath, template)
  }

  const readme = readFileSync(readmePath).toString()
  const readmeParts = readme.split(/^(?=## )/m).map((mainSection: string) => mainSection.split(/^(?=### )/m))
  const solutions = readmeParts[2]
  const existingDays = solutions.map((section: string) => Number(section.substring(9, section.indexOf(':')))).filter((day: number) => !isNaN(day))

  const dayRange = Array.from({ length: new Date().getDate() }, (_, index) => index + 1)

  for (const day of dayRange) {
    if (!existingDays.includes(day)) {
      const response = await fetch(`${baseUrl}/${year}/day/${day}`, getRequestHeaders())
      const htmlString = await response.text()

      parseHtmlStringForReadme(day, year, htmlString)

      if (day !== dayRange[dayRange.length - 1]) {
        const timeout = 30000
        const timeoutLength = `${timeout}`.length

        process.stdout.write(kleur.green(`\nThrottle ms after day ${day} remaining: ${timeout}`))
        const start = Date.now()
        let now = start
        while (now - start < timeout) {
          now = Date.now()

          const runTime = 30000 - (now - start)
          const runTimeLength = `${runTime}`.length
          process.stdout.write(cursorBackward(timeoutLength) + ' '.repeat(timeoutLength - runTimeLength) + runTime)
        }
        process.stdout.write(eraseStartLine + cursorLeft)
      }
    }
  }
}

//#endregion
