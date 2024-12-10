import kleur from 'kleur'
import { performance } from 'perf_hooks'
import { Day, PartNum, RunParams } from 'utils/dataTypes/index.js'
import { printRunTime } from 'utils/printing/index.js'

const params: RunParams = {
  year: (process.env.npm_config_year ?? new Date().getFullYear()) as number,
  day: (process.env.npm_config_daynum ?? 0) as number,
  part: (process.env.npm_config_part ?? 'all') as PartNum,
  isTest: process.env.npm_config_t !== undefined,
}

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
