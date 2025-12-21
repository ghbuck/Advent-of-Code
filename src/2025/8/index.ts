import { Point3D, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { distanceBetweenPoints } from '@utils/maths/geometry.js'
import { printAnswers } from '@utils/printing/index.js'

interface JunctionBox {
  name: string
  position: Point3D
  connections: JunctionBox[]
}

const parseInput = (input: string): JunctionBox[] => {
  return input.split('\n').map((line: string) => {
    const name = line
    const parts = line.split(',')
    return {
      name,
      position: {
        x: Number(parts[0]),
        y: Number(parts[1]),
        z: Number(parts[2]),
      },
      connections: [],
    }
  })
}

const findClosestConnections = (junctionBoxes: JunctionBox[]): [JunctionBox, JunctionBox][] => {
  const seenCombos = new Set<string>()
  const organizedBoxes: [number, JunctionBox, JunctionBox][] = []

  for (const box1 of junctionBoxes) {
    for (const box2 of junctionBoxes) {
      if (box1 !== box2) {
        const comboKey = [box1.name, box2.name].sort().join('-')
        if (seenCombos.has(comboKey)) continue
        seenCombos.add(comboKey)

        const distance = distanceBetweenPoints(box1.position, box2.position)
        organizedBoxes.push([distance, box1, box2])
      }
    }
  }

  return organizedBoxes.sort((a, b) => b[0] - a[0]).map(([, box1, box2]) => [box1, box2])
}

const mapCircuits = (junctionBoxes: JunctionBox[]) => {
  const circuits: JunctionBox[][] = []
  const visited = new Set<JunctionBox>()

  for (const box of junctionBoxes) {
    if (visited.has(box)) {
      continue
    }

    // Start a new circuit
    const circuit: JunctionBox[] = []
    const toVisit = [box]

    while (toVisit.length) {
      // Explore adjacent junctions to find all members of the subgraph
      const current = toVisit.pop()
      if (!current) continue

      if (visited.has(current)) {
        continue
      }

      visited.add(current)
      circuit.push(current)

      for (const connection of current.connections) {
        toVisit.push(connection)
      }
    }

    circuits.push(circuit)
  }

  return circuits
}

const connectJunctionBoxes = (allBoxes: JunctionBox[], closestConnections: [JunctionBox, JunctionBox][], part1Attempts: number): [number, number] => {
  let part1Answer = 0
  let part2Answer = 0

  let numAttempts = 0

  while (part1Answer === 0 || part2Answer === 0) {
    const [box1, box2] = closestConnections.pop() ?? [null, null]
    if (!box1 || !box2) break

    box1.connections.push(box2)
    box2.connections.push(box1)
    numAttempts++

    const circuits = mapCircuits(allBoxes)

    if (circuits.length === 1) {
      part2Answer = box1.position.x * box2.position.x
    } else if (numAttempts === part1Attempts) {
      part1Answer = circuits
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .reduce((total, circuit) => total * circuit.length, 1)
    }
  }

  return [part1Answer, part2Answer]
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 40 : 42840,
    part2: params.isTest ? 25272 : 170629052,
  }

  const junctionBoxes = parseInput(await getInput(params))
  const closestConnections = findClosestConnections(junctionBoxes)

  const [part1Answer, part2Answer] = connectJunctionBoxes(junctionBoxes, closestConnections, params.isTest ? 10 : 1000)

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? part1Answer : undefined,
    answer2: params.part === 'all' || params.part === 2 ? part2Answer : undefined,
    solution,
  })
}
