/**
 * I really didn't do this day well and the code is a mess.
 * Attempts to adjust the main file to work with crates just kept getting
 * more and more complicated. I finally gave up and just wrote a new file…
 */
import { Point, cardinalDirections, tokensToDirections } from '@utils/dataTypes/index.js'
import { Grid } from '@utils/models/Grid.js'

import kleur from 'kleur'

//#region file globals

const robot = '@'
const aWall = '#'
const freeSpace = '.'

const aBox = '['
const aBox1 = ']'

type MoveChars = '^' | '>' | 'v' | '<'

interface ParsingResult {
  grid: Grid<string>
  moves: MoveChars[]
}

const tryToMoveCrate = (
  grid: Grid<string>,
  nextPoint: Point,
  firstChar: string,
  move: MoveChars,
  deltas: Point,
  cratesToMove = new Set<string>(),
): Set<string> | null => {
  const leftColumn = firstChar === aBox ? nextPoint.x : nextPoint.x - 1
  const rightColumn = leftColumn + 1

  if (move === '<' || move === '>') {
    const secondPoint: Point = {
      x: move === '<' ? leftColumn - 1 : rightColumn + 1,
      y: nextPoint.y,
    }
    const secondChar = grid.getCellItems(secondPoint)?.[0]

    if (secondChar === aWall) return null

    if (secondChar === aBox || secondChar === aBox1) {
      if (!tryToMoveCrate(grid, secondPoint, secondChar, move, deltas, cratesToMove)) return null
    }

    cratesToMove.add(`${leftColumn},${nextPoint.y}`)
    return cratesToMove
  } else {
    const nextRow = nextPoint.y + deltas.y

    const secondPoint: Point = {
      x: leftColumn,
      y: nextRow,
    }
    const thirdPoint: Point = {
      x: rightColumn,
      y: nextRow,
    }

    const nextLeftChar = grid.getCellItems(secondPoint)?.[0]
    const nextRightChar = grid.getCellItems(thirdPoint)?.[0]

    if (nextLeftChar === aWall || nextRightChar === aWall) return null

    if (nextLeftChar === aBox) {
      if (!tryToMoveCrate(grid, secondPoint, nextLeftChar, move, deltas, cratesToMove)) return null
    } else {
      if (nextLeftChar === aBox1 && !tryToMoveCrate(grid, secondPoint, nextLeftChar, move, deltas, cratesToMove)) return null
      if (nextRightChar === aBox && !tryToMoveCrate(grid, thirdPoint, nextRightChar, move, deltas, cratesToMove)) return null
    }
  }

  cratesToMove.add(`${leftColumn},${nextPoint.y}`)
  return cratesToMove
}

export const processCrateMovement = ({ grid, moves }: ParsingResult): Grid<string> => {
  let robotLocation = grid.findPoint(robot)
  if (robotLocation === undefined) throw new Error(kleur.red('Robot location not found'))

  for (const move of moves) {
    const direction = tokensToDirections.get(move) ?? 'north'
    const deltas = cardinalDirections.get(direction) ?? { x: 0, y: -1 }

    const nextPoint: Point = {
      x: robotLocation.x + deltas.x,
      y: robotLocation.y + deltas.y,
    }

    const nextChar = grid.getCellItems(nextPoint)?.[0] ?? freeSpace

    if (nextChar === '#') continue

    if (nextChar === aBox || nextChar === aBox1) {
      const cratesToMove = tryToMoveCrate(grid, nextPoint, nextChar, move, deltas)

      if (cratesToMove === null)
        continue

        // Move the crates
      ;[...cratesToMove]
        .map((crate) => crate.split(',').map(Number))
        .forEach((crate) => {
          grid.deleteItem(aBox, { x: crate[0], y: crate[1] })
          grid.deleteItem(aBox1, { x: crate[0] + 1, y: crate[1] })
          grid.putItem(aBox, { x: crate[0] + deltas.x, y: crate[1] + deltas.y })
          grid.putItem(aBox1, { x: crate[0] + deltas.x + 1, y: crate[1] + deltas.y })
        })
    }

    // Move the robot
    grid.deleteItem(robot, robotLocation)
    grid.putItem(robot, nextPoint)
    robotLocation = nextPoint
  }

  return grid
}
