import { RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { printAnswers } from 'utils/printing/index.js'

interface RuleDef {
  before: Set<number>
  after: Set<number>
}

interface ProcessedUpdates {
  valid: number[][]
  invalid: number[][]
}

type RulesMap = Map<number, RuleDef>

const getRule = (rules: RulesMap, item: number): RuleDef => {
  let rule = rules.get(item)

  if (rule === undefined) {
    rule = {
      before: new Set<number>(),
      after: new Set<number>(),
    }

    rules.set(item, rule)
  }

  return rule
}

const getRules = (rulesString: string): RulesMap => {
  const rulesArray = rulesString
    .split('\n')
    .map((row) => row.split('|').map(Number))

  const rules = new Map<number, RuleDef>()
  for (const item of rulesArray) {
    const rule1 = getRule(rules, item[0])
    const rule2 = getRule(rules, item[1])

    rule1.before.add(item[1])
    rule2.after.add(item[0])
  }

  return rules
}

const processUpdates = (
  rules: RulesMap,
  updates: string[],
): ProcessedUpdates => {
  const processedUpdates: ProcessedUpdates = {
    valid: [],
    invalid: [],
  }

  for (const update of updates) {
    const pages = update.split(',').map(Number)

    let isValid = true
    for (let pageIndex = 0; pageIndex < pages.length && isValid; ++pageIndex) {
      const page = pages[pageIndex]
      const pageRules = rules.get(page)

      if (pageRules !== undefined) {
        const nextPages = new Set(pages.slice(pageIndex + 1))
        isValid = nextPages.intersection(pageRules.after).size === 0
      }
    }

    if (isValid) {
      processedUpdates.valid.push(pages)
    } else {
      processedUpdates.invalid.push(pages)
    }
  }

  return processedUpdates
}

const fixInvalidUpdates = (
  rules: RulesMap,
  updates: number[][],
): number[][] => {
  const fixedUpdates: number[][] = []

  for (const update of updates) {
    const fixedPages = update.toSorted((a: number, b: number): number =>
      rules.get(a)?.after.has(b) ? -1 : rules.get(b)?.after.has(a) ? 1 : 0,
    )

    fixedUpdates.push(fixedPages)
  }

  return fixedUpdates
}

export const run = (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 143 : 4578,
    part2: params.isTest ? 123 : 6179,
  }

  const inputString = getInput(params)
  const inputArray = inputString.split('\n\n')

  const rules = getRules(inputArray[0])
  const updates = inputArray[1].split('\n')

  const processedUpdates = processUpdates(rules, updates)
  const fixedUpdates = fixInvalidUpdates(rules, processedUpdates.invalid)

  printAnswers({
    params,
    answer1: processedUpdates.valid.reduce(
      (total: number, row: number[]) =>
        (total += row[Math.floor(row.length / 2)]),
      0,
    ),
    answer2: fixedUpdates.reduce(
      (total: number, row: number[]) =>
        (total += row[Math.floor(row.length / 2)]),
      0,
    ),
    solution,
  })
}
