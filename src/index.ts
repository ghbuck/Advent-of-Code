import { Day, PartNum, RunParams } from '@utils/dataTypes/index.js'
import { createNewDay, setSessionId } from '@utils/files/index.js'
import { printRunTime } from '@utils/printing/index.js'

import kleur from 'kleur'
import { performance } from 'perf_hooks'

const defaultDate = new Date()
let sessionId = ''

const params: RunParams = {
  year: defaultDate.getMonth() === 12 ? defaultDate.getFullYear() : defaultDate.getFullYear() - 1,
  day: defaultDate.getDate(),
  part: 'all',
  isTest: false,
  testPart: 0,
  createNewDay: false,
  saveSessionId: false,
}

const args = process.argv.slice(2)

for (const [index, arg] of args.entries()) {
  if (index === 0 && !Number.isNaN(Number(arg))) {
    params.day = Number(arg)
    continue
  }

  const nextArg = args[index + 1]
  switch (arg) {
    case '-y':
    case '--year':
      params.year = Number(nextArg)
      break
    case '-d':
    case '--day':
      params.day = Number(nextArg)
      break
    case '-p':
    case '--part':
      if (nextArg === '1' || nextArg == '2') {
        params.part = Number(nextArg) as PartNum
      }
      break
    case '-t':
    case '--test':
      params.isTest = true
      if (!isNaN(Number(nextArg))) {
        params.testPart = Number(nextArg)
      }
      break
    case '--newday':
      params.createNewDay = true
      break
    case '--session':
      params.saveSessionId = true
      if (nextArg === undefined || !(nextArg.length > 100)) {
        throw new Error(kleur.red('No session id value found in `process.argv`'))
      }
      sessionId = nextArg
      break
  }
}

const runDay = async (params: RunParams) => {
  try {
    const dayToRun = (await import(`./${params.year}/${params.day}`)) as Day

    const start = performance.now()
    await dayToRun.run(params)

    printRunTime(start, performance.now())
  } catch (error) {
    if ((error as Error).message.startsWith('Cannot find module')) {
      console.error(kleur.red(`Cannot find the index.ts for day ${params.day}, year ${params.year}\n`))
    } else {
      console.error(error)
    }
  }
}

if (params.createNewDay) {
  await createNewDay(params)
} else if (params.saveSessionId) {
  setSessionId(sessionId)
} else {
  await runDay(params)
}
