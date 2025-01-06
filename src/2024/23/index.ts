import { bronKerbosch } from '@utils/algorithms/index.js'
import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

const parseInputForMap = (input: string): Map<string, string[]> => {
  const baseArray = input.split('\n').map((line: string) => line.split('-'))

  const networkSetMap = new Map<string, Set<string>>()

  for (const [comp1, comp2] of baseArray) {
    const network1 = networkSetMap.get(comp1) ?? new Set<string>()
    const network2 = networkSetMap.get(comp2) ?? new Set<string>()

    network1.add(comp2)
    network2.add(comp1)

    networkSetMap.set(comp1, network1)
    networkSetMap.set(comp2, network2)
  }

  const networkMap = new Map<string, string[]>()
  for (const [key, value] of networkSetMap) {
    networkMap.set(key, [...value])
  }

  return networkMap
}

const findHistorianComputer = (input: string): string[] => {
  const networkSets = new Set<string>()
  const networkMap = parseInputForMap(input)

  for (const [firstComputer, firstConnections] of networkMap) {
    for (const secondComputer of firstConnections) {
      const secondConnections = networkMap.get(secondComputer) ?? []
      for (const thirdComputer of secondConnections) {
        const thirdConnections = networkMap.get(thirdComputer) ?? []
        if (thirdConnections.includes(firstComputer)) {
          networkSets.add([firstComputer, secondComputer, thirdComputer].sort().join('-'))
        }
      }
    }
  }

  return [...networkSets].filter((networkString: string) => networkString.match(/^t|-t/g) !== null)
}

const findLanWithAllComputers = (input: string): string => {
  const edges = input.split('\n').map((line: string) => line.split('-') as [string, string])
  const vertices = new Set<string>(edges.flat())

  const cliques: Set<string>[] = []

  bronKerbosch(
    {
      vertices: [...vertices],
      edges: edges,
    },
    cliques,
    vertices,
  )

  const largestClique = cliques.reduce((largest, currentClique) => (currentClique.size > largest.size ? currentClique : largest), new Set<string>())

  return [...largestClique].sort().join(',')
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 7 : 1238,
    part2: params.isTest ? 'co,de,ka,ta' : 'bg,bl,ch,fn,fv,gd,jn,kk,lk,pv,rr,tb,vw',
  }

  const input = await getInput(params)
  const possibleHistorianLanLocations = findHistorianComputer(input)
  const largestLandWithAllComputers = findLanWithAllComputers(input)

  printAnswers({
    params,
    answer1: possibleHistorianLanLocations.length,
    answer2: largestLandWithAllComputers,
    solution,
  })
}
