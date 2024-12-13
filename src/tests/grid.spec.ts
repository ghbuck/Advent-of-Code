import { beforeEach, describe, expect, test } from '@jest/globals'
import { Grid, IGrid } from 'utils/models/Grid.js'
import { testStringGrid } from './testData/grid.js'

describe('Grid model tests', () => {
  let grid: Grid<string> | undefined
  const constructorArgs: IGrid<string> = {
    input: testStringGrid,
    splitter1: '\n',
    splitter2: '',
    typeConstructor: String,
  }

  const testArray = testStringGrid.split('\n').map((row: string) => row.split(''))

  const numTestRows = testArray.length
  const numTestCols = testArray[0].length

  const randomRowIndex = Math.floor(Math.random() * (numTestRows + 1))
  const randomColIndex = Math.floor(Math.random() * (numTestCols + 1))

  const testItem = testArray[randomRowIndex][randomColIndex]

  describe('Constructor tests', () => {
    beforeEach(() => {
      if (grid !== undefined) {
        grid = undefined
      }
    })

    test('Test undefined args constructor', () => {
      grid = new Grid<string>()
      expect(grid).toBeDefined()
      expect(grid.getUniqueItems().size).toEqual(0)
    })

    test('Test defined args constructor', () => {
      grid = new Grid<string>(constructorArgs)
      expect(grid).toBeDefined()

      const gridMatrix = grid.getRowCount() * grid.getColumnCount()
      const arrayMatrix = numTestRows * numTestCols
      expect(gridMatrix).toEqual(arrayMatrix)
    })

    test('Test setGrid(args) constructing', () => {
      grid = new Grid<string>()
      expect(grid).toBeDefined()
      expect(grid.getUniqueItems().size).toEqual(0)

      grid.setGrid(constructorArgs)
      expect(grid).toBeDefined()

      const gridMatrix = grid.getRowCount() * grid.getColumnCount()
      const arrayMatrix = numTestRows * numTestCols
      expect(gridMatrix).toEqual(arrayMatrix)
    })
  })

  describe('Data tests', () => {
    beforeEach(() => {
      if (grid === undefined) {
        grid = new Grid<string>(constructorArgs)
      }
    })

    test('getRow(\\d) returns the same values an array[\\d][y] lookup', () => {
      if (grid !== undefined) {
        for (const [index, row] of testArray.entries()) {
          const gridRow = index + 1
          expect(grid.getRow(gridRow)).toEqual(row)
        }
      }
    })

    test('getColumn(\\d) returns the same values an array[x][\\d] lookup', () => {
      if (grid !== undefined) {
        for (let colIndex = 0; colIndex < numTestCols; ++colIndex) {
          const col = testArray.map((row: string[]) => row[colIndex])
          const gridCol = colIndex + 1
          expect(grid.getColumn(gridCol)).toEqual(col)
        }
      }
    })

    test('getItem(y, x) returns the same value as array[y][x] lookup', () => {
      if (grid !== undefined) {
        const gridItem = grid.getItem(randomRowIndex + 1, randomColIndex + 1)
        expect(gridItem).toEqual(testItem)
      }
    })

    test('findPoints(item) returns same points as finding with an array loop', () => {
      if (grid !== undefined) {
        const arrayTuples: [number, number][] = []
        const gridTuples: [number, number][] = []

        for (const [rowIndex, row] of testArray.entries()) {
          for (const [colIndex, item] of row.entries()) {
            if (item === testItem) {
              arrayTuples.push([colIndex, rowIndex])
            }
          }
        }

        const gridPoints = grid.findPoints(testItem)
        for (const point of gridPoints) {
          gridTuples.push([point.x, point.y])
        }

        expect(gridTuples.length).toEqual(arrayTuples.length)
        expect(gridTuples.join()).toEqual(arrayTuples.join())
      }
    })
  })
})
