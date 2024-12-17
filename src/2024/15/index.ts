import { cursorBackward, cursorLeft, eraseEndLine, eraseLine } from 'ansi-escapes'
import kleur from 'kleur'
import { Point, RunParams, Solution } from 'utils/dataTypes/index.js'
import { getInput } from 'utils/files/index.js'
import { DrawGridParams, Grid, NeighborLocation } from 'utils/models/Grid.js'
import { printAnswers } from 'utils/printing/index.js'

//#region file globals

const robot = '@'
const aWall = '#'

let aBox = 'O'
const aBox1 = ']'

const drawParams: DrawGridParams<string> = {
  onlyTopItem: true,
  animationTimeout: 100,
}

type MoveChars = '^' | '>' | 'v' | '<'
type MoveDirections = Map<MoveChars, NeighborLocation>

const directionMap: MoveDirections = new Map<MoveChars, NeighborLocation>([
  ['^', 'above'],
  ['>', 'right'],
  ['v', 'below'],
  ['<', 'left'],
])

interface Deltas extends Point {
  key: number
}

interface MoveParams {
  grid: Grid<string>
  origLocation: Point
  move: MoveChars
  deltas: Deltas
  numItems: number
  isTest: boolean
}

interface DestInfo {
  move: MoveChars
  destKey: number
  destItem: string | undefined
  canMove: boolean
}

interface ParsingResult {
  grid: Grid<string>
  moves: MoveChars[]
}

//#endregion

const parseInput = async (params: RunParams, isRun2: boolean): Promise<ParsingResult> => {
  const inputString = await getInput(params)
  const input = inputString.split(/\n\n/)

  if (isRun2) {
    input[0] = input[0].replaceAll('#', '##').replaceAll('O', '[]').replaceAll('.', '..').replaceAll('@', '@.')
  }

  return {
    grid: new Grid<string>({
      input: input[0],
      splitter1: '\n',
      splitter2: '',
      typeConstructor: String,
    }),
    moves: input[1].replaceAll('\n', '').split('') as MoveChars[],
  }
}

const getDestItem = (grid: Grid<string>, robotLocation: Point, moves: MoveChars[]): DestInfo => {
  const robotKey = grid.getCellKey(robotLocation)
  if (robotKey === undefined) throw new Error(kleur.red('Robot cell not found'))

  const move = moves.shift()
  if (move === undefined) throw new Error(kleur.red('Move array has undefined items in it'))

  const direction = directionMap.get(move)
  if (direction === undefined) throw new Error(kleur.red('Unexpected move encountered'))

  const boxMap = grid.mapTheNeighborhood(robotKey)

  const destKey = boxMap.get(direction)
  if (destKey === undefined) throw new Error(kleur.red('Destination key is undefined'))

  const destItem = grid.getCellItemsByKey(destKey ?? -1)?.[0]

  return {
    move,
    destKey,
    destItem,
    canMove: destItem !== aWall,
  }
}

const getDestinations = (params: MoveParams): [Point, Point] => {
  const robotDest = {
    x: params.origLocation.x + params.deltas.x,
    y: params.origLocation.y + params.deltas.y,
  }
  return [
    robotDest,
    {
      x: robotDest.x + params.deltas.x * params.numItems,
      y: robotDest.y + params.deltas.y * params.numItems,
    },
  ]
}

const moveBoxes = (params: MoveParams): Point => {
  const [robotDest, farthestBoxDest] = getDestinations(params)

  params.grid.deleteItem(aBox, robotDest)
  params.grid.putItem(aBox, farthestBoxDest)

  if (params.isTest) {
    params.grid.drawGrid(drawParams)
  }

  return robotDest
}

const moveCratesHorizontally = (params: MoveParams, crateDest: Point) => {
  for (let itemNum = 1; itemNum <= params.numItems; ++itemNum) {
    const crateOrigin: Point = {
      x: crateDest.x - params.deltas.x,
      y: crateDest.y,
    }

    const item = params.grid.getCellItems(crateOrigin)?.[0]

    if (item !== undefined) {
      params.grid.deleteItem(item, crateOrigin)
      params.grid.putItem(item, crateDest)
    }

    crateDest = crateOrigin
  }
}

const moveCratesVertically = (params: MoveParams, crateDest: Point) => {
  for (let itemNum = 1; itemNum <= params.numItems; ++itemNum) {
    const crateOrigin: Point = {
      x: crateDest.x - params.deltas.x,
      y: crateDest.y,
    }

    const item = params.grid.getCellItems(crateOrigin)?.[0]

    if (item !== undefined) {
      params.grid.deleteItem(item, crateOrigin)
      params.grid.putItem(item, crateDest)
    }

    crateDest = crateOrigin
  }
}

const moveCrates = (params: MoveParams): Point => {
  const [robotDest, crateDest] = getDestinations(params)

  if (params.move === '<' || params.move === '>') {
    moveCratesHorizontally(params, crateDest)
  } else {
    moveCratesVertically(params, crateDest)
  }

  if (params.isTest) {
    params.grid.drawGrid(drawParams)
  }

  return robotDest
}

const moveRobot = (grid: Grid<string>, robotLocation: Point, newLocation: Point, isTest: boolean): Point => {
  grid.deleteItem(robot, robotLocation)
  grid.putItem(robot, newLocation)

  if (isTest) {
    grid.drawGrid(drawParams)
  }

  return newLocation
}

const processMovement = ({ grid, moves }: ParsingResult, isRun2: boolean, isTest: boolean): Grid<string> => {
  if (isRun2) {
    aBox = '['
  }

  let robotLocation = grid.findPoint(robot)
  if (robotLocation === undefined) throw new Error(kleur.red('Robot location not found'))

  let cursorLength = `${moves.length}`.length
  if (isTest) {
    grid.drawGrid(drawParams)
  } else {
    process.stdout.write(kleur.green(`Moves remaining: ${moves.length}`))
  }

  while (moves.length > 0) {
    if (!isTest) {
      process.stdout.write(cursorBackward(cursorLength) + eraseEndLine + `${moves.length}`)
      cursorLength = `${moves.length}`.length
    }

    const destInfo = getDestItem(grid, robotLocation, moves)
    const { move, destKey, destItem } = destInfo
    let { canMove } = destInfo

    if (!canMove) {
      continue
    }

    const keyDelta = move === '^' ? -grid.getColumnCount() : move === '>' ? 1 : move === 'v' ? grid.getColumnCount() : -1

    let numBoxes = 0
    const keysToMove: number[][] = []

    if (destItem !== undefined && (destItem === aBox || destItem === aBox1)) {
      let nextKeys = [destKey]
      let nextItems: (string | undefined)[] = [destItem]

      do {
        keysToMove.push(nextKeys)

        nextKeys = nextKeys.map((key: number) => (key += keyDelta))
        nextItems = nextKeys.map((key: number) => grid.getCellItemsByKey(key)?.[0])
      } while (nextItems.includes(aBox) || nextItems.includes(aBox1))

      canMove = !nextItems.includes(aWall)
      numBoxes = keysToMove.length
    }

    let robotDest: Point | undefined
    const moveParams: MoveParams = {
      grid,
      origLocation: robotLocation,
      move,
      deltas: {
        key: keyDelta,
        x: move === '^' || move === 'v' ? 0 : move === '>' ? 1 : -1,
        y: move === '<' || move === '>' ? 0 : move === 'v' ? 1 : -1,
      },
      numItems: numBoxes,
      isTest,
    }

    if (canMove && numBoxes > 0) {
      if (isRun2) {
        robotDest = moveCrates(moveParams)
      } else {
        robotDest = moveBoxes(moveParams)
      }
    } else if (canMove) {
      ;[robotDest] = getDestinations(moveParams)
    }

    if (canMove && robotDest !== undefined) {
      robotLocation = moveRobot(grid, robotLocation, robotDest, isTest)
    }
  }

  if (!isTest) {
    process.stdout.write(eraseLine + cursorLeft)
  }

  return grid
}

const getBoxesGpsScore = (grid: Grid<string>, aBox: string): number => {
  return grid
    .findPoints(aBox)
    .map((point: Point) => point.x + 100 * point.y)
    .reduce((total: number, current: number) => total + current, 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 10092 : 1398947,
    part2: params.isTest ? 9021 : undefined,
  }

  const result1 = await parseInput(params, false)
  const grid1 = processMovement(result1, false, params.isTest)
  const savedABox = aBox

  // const result2 = await parseInput(params, true)
  // const grid2 = processMovement(result2, true, true)

  printAnswers({
    params,
    answer1: getBoxesGpsScore(grid1, savedABox),
    answer2: undefined,
    solution,
  })
}
