import { Point, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { IBounds } from '@utils/models/Bounds.js'
import { Grid } from '@utils/models/Grid.js'
import { printAnswers } from '@utils/printing/index.js'

import { cursorBackward, cursorPrevLine, eraseLine } from 'ansi-escapes'
import kleur from 'kleur'

type Velocity = Point

interface RobotInfo {
  position: Point
  velocity: Velocity
}

const parseInput = (input: string): RobotInfo[] => {
  return input
    .split('\n')
    .map((row: string): string[] => row.split(' '))
    .map((row: string[]): RobotInfo => {
      const positionMatch = row[0].match(/[pv]=([-\d]+),([-\d]+)/)
      const velocityMatch = row[1].match(/[pv]=([-\d]+),([-\d]+)/)
      return {
        position: { x: Number(positionMatch?.[1]), y: Number(positionMatch?.[2]) },
        velocity: { x: Number(velocityMatch?.[1]), y: Number(velocityMatch?.[2]) },
      }
    })
}

const makeGrid = (bounds: IBounds): Grid<RobotInfo> => {
  const grid = new Grid<RobotInfo>()

  grid.setBounds(bounds)

  return grid
}

const simulateRobotMovement = (gridWidth: number, gridHeight: number, robotInfo: RobotInfo, runTime: number): RobotInfo => {
  const newX = (robotInfo.position.x + runTime * robotInfo.velocity.x) % gridWidth
  const newY = (robotInfo.position.y + runTime * robotInfo.velocity.y) % gridHeight

  robotInfo.position = {
    x: newX >= 0 ? newX : newX + gridWidth,
    y: newY >= 0 ? newY : newY + gridHeight,
  }

  return robotInfo
}

const calculateSafetyFactor = (grid: Grid<RobotInfo>): number => {
  const bounds = grid.getBounds()
  const midX = bounds.getMaxX() / 2
  const midY = bounds.getMaxY() / 2

  const quadrants: number[] = Array<number>(4).fill(0)

  const rowCount = grid.getRowCount()
  const colCount = grid.getColumnCount()

  for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
    for (let colIndex = 0; colIndex < colCount; ++colIndex) {
      const numRobots = grid.getCellItems({ x: colIndex, y: rowIndex })?.length ?? 0
      const quadrantIndex =
        rowIndex < midY && colIndex < midX
          ? 0
          : rowIndex < midY && colIndex > midX
            ? 1
            : rowIndex > midY && colIndex < midX
              ? 2
              : rowIndex > midY && colIndex > midX
                ? 3
                : undefined

      if (quadrantIndex !== undefined) {
        quadrants[quadrantIndex] = quadrants[quadrantIndex] + numRobots
      }
    }
  }

  return quadrants.reduce((factor: number, count: number) => factor * count, 1)
}

const runSimulation = (grid: Grid<RobotInfo>, robotInfo: RobotInfo[], runTime: number): Grid<RobotInfo> => {
  const bounds = grid.getBounds()
  const gridWidth = bounds.getMaxX() + 1
  const gridHeight = bounds.getMaxY() + 1

  const simulatedRobots: RobotInfo[] = robotInfo.map((robot: RobotInfo) => simulateRobotMovement(gridWidth, gridHeight, robot, runTime))
  simulatedRobots.forEach((robot: RobotInfo) => grid.putItem(robot, robot.position))

  return grid
}

const getSafetyFactor = (inputString: string, bounds: IBounds): number => {
  const part1Robots = parseInput(inputString)
  const grid = runSimulation(makeGrid(bounds), part1Robots, 100)

  return calculateSafetyFactor(grid)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 12 : 228410028,
    part2: params.isTest ? undefined : 8258,
  }

  const inputString = await getInput(params)
  const bounds: IBounds = {
    max: params.isTest ? { x: 10, y: 6 } : { x: 100, y: 102 },
  }

  let safteyFactor: number | undefined
  if (params.part === 1 || params.part === 'all') {
    safteyFactor = getSafetyFactor(inputString, bounds)
  }

  let runTime: number | undefined
  if (params.part === 2 || params.part === 'all') {
    runTime = 0

    let treeFound = false
    let grid = makeGrid(bounds)

    process.stdout.write(kleur.green('Searching for the christmas tree…\nAttempt:    0'))
    while (!treeFound) {
      process.stdout.write(cursorBackward(`${runTime}`.length) + runTime)

      const part2Robots = parseInput(inputString)

      grid = runSimulation(grid, part2Robots, ++runTime)
      treeFound = grid.clusteredWithinDistance(50)

      if (!treeFound) {
        grid.setBounds(bounds)
      }
    }

    process.stdout.write(eraseLine + cursorPrevLine + eraseLine)

    if (treeFound && grid !== undefined && params.other?.drawTree === 'true') {
      grid.drawGrid({ replacer: '\\d' })
    }
  }

  printAnswers({
    params,
    answer1: safteyFactor,
    answer2: runTime,
    solution,
  })
}
