import kleur from 'kleur'
import type { AnswerParams } from 'utils/dataTypes/index.js'

const checkAnswer = (answer: number | undefined, solution: number | undefined): string => {
  return answer === undefined ? kleur.yellow('unrun') : answer === solution ? kleur.green('correct') : solution === undefined ? kleur.yellow('unsolved') : kleur.red('incorrect')
}

export const printAnswers = ({ params: { day, part }, answer1, answer2, solution }: AnswerParams) => {
  const doPart1 = part === 'all' || part === 1
  const doPart2 = part === 'all' || part === 2

  if (doPart1) {
    console.log(kleur.blue(`Day ${day}, Part 1 answer: ${answer1 ?? ''} (${checkAnswer(answer1, solution.part1)}) ${!doPart2 ? '\n' : ''}`))
  }

  if (doPart2) {
    console.log(kleur.blue(`Day ${day}, Part 2 answer: ${answer2 ?? ''} (${checkAnswer(answer2, solution.part2)})\n`))
  }
}

const longRunTime = 5000
const veryLongRunTime = 10000
const whatTheHellAreYouDoingRunTime = 15000

export const printRunTime = (start: number, end: number) => {
  const totalTime = end - start

  let timeString: string
  if (totalTime < 1000) {
    timeString = kleur.green(`${totalTime.toFixed(3)} ms`)
  } else {
    let colorFunction: (string: string) => string

    switch (true) {
      case totalTime < longRunTime:
        colorFunction = kleur.green
        break
      case totalTime < veryLongRunTime:
        colorFunction = kleur.yellow
        break
      case totalTime < whatTheHellAreYouDoingRunTime:
        colorFunction = kleur.red
        break
      default:
        colorFunction = kleur.bgRed
    }

    timeString = colorFunction(`${Math.round(totalTime / 1000).toFixed(3)} s`)
  }

  console.log(`Run time: ${timeString}\n`)
}
