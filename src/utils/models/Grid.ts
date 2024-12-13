import kleur from 'kleur'
import { Point } from 'utils/dataTypes/index.js'
import { Bounds } from 'utils/models/Bounds.js'

export interface IGrid<T> {
  input: string
  splitter1: string
  splitter2: string
  typeConstructor: () => T
}

export interface RegionInfo {
  cellNumbers: number[]
  area: number
  perimeter: number
}

export interface RegionResponse<T> {
  item: T
  regions: RegionInfo[]
}

interface Cell<T> {
  item: T | undefined
  point: Point
}

interface NeighborKeys {
  above: number | undefined
  below: number | undefined
  left: number | undefined
  right: number | undefined
}

export class Grid<T> {
  #cells: Map<number, Cell<T>>
  #bounds: Bounds

  constructor(args: IGrid<T>) {
    this.#cells = new Map<number, Cell<T>>()

    const inputArray = args.input.split(args.splitter1).map((row: string) => row.split(args.splitter2).map(args.typeConstructor))

    this.#bounds = new Bounds({
      max: {
        x: inputArray.reduce((longestRow, row) => (row.length > longestRow.length ? row : longestRow), []).length - 1,
        y: inputArray.length - 1,
      },
    })

    let counter = 0
    for (let rowIndex = 0; rowIndex <= this.#bounds.getMaxY(); ++rowIndex) {
      for (let colIndex = 0; colIndex <= this.#bounds.getMaxX(); ++colIndex) {
        this.#cells.set(++counter, {
          item: inputArray[rowIndex]?.[colIndex],
          point: {
            x: colIndex,
            y: rowIndex,
          },
        })
      }
    }
  }

  //#region Row methods

  /**
   *
   * @param {T} rowNum - the row to access (i.e.: 1 = first row)
   * @returns the column map for the requested row
   */
  getRow(rowNum: number): (T | undefined)[] {
    const row: (T | undefined)[] = []

    if (rowNum > 0 && rowNum <= this.#bounds.getMaxY() + 1) {
      const colCount = this.#bounds.getMaxX() + 1
      for (const [key, value] of this.#cells) {
        const comparator = key / colCount
        if (comparator > rowNum - 1 && comparator <= rowNum) {
          row.push(value.item)
        }
      }
    }

    return row
  }

  /**
   *
   * @returns the number of grid rows
   */
  getRowCount(): number {
    return this.#bounds.getMaxY() + 1
  }

  /**
   * enlarges the grid by one row and will add items if desired
   * @throws {Error} if items.length > grid.bounds.max.x
   */
  addRow(items?: T[]) {
    if (items !== undefined && items.length > this.#bounds.getMaxX() + 1) {
      throw new Error(kleur.red('The number of items supplied to the grid exceeds the number of columns'))
    }

    this.#bounds.put({
      x: this.#bounds.getMaxX(),
      y: this.#bounds.getMaxY() + 1,
    })

    let counter = this.#cells.size
    for (let colIndex = 0; colIndex <= this.#bounds.getMaxX(); ++colIndex) {
      this.#cells.set(++counter, {
        item: items?.[colIndex],
        point: {
          x: colIndex,
          y: this.#bounds.getMaxY(),
        },
      })
    }
  }

  //#endregion

  //#region Column methods

  /**
   *
   * @param colNum - the column to access (i.e.: 1 = first column)
   * @returns an array of sliced column values
   */
  getColumn(colNum: number): (T | undefined)[] {
    const col: (T | undefined)[] = []

    const colCount = this.#bounds.getMaxX() + 1
    if (colNum > 0 && colNum <= colCount) {
      const checkValue = colNum === colCount ? 0 : colNum / colCount

      for (const [key, value] of this.#cells) {
        const calcValue = key / colCount - Math.floor(key / colCount)

        if (calcValue.toFixed(10) === checkValue.toFixed(10)) {
          col.push(value.item)
        }
      }
    }

    return col
  }

  /**
   *
   * @returns the number of grid columns
   */
  getColumnCount(): number {
    return this.#bounds.getMaxX() + 1
  }

  // TODO: add this logic
  /**
   * adds a column to the grid
   */
  addColumn() {
    // const
  }

  //#endregion

  //#region Cell methods

  /**
   * a useful method for when you need to do things with
   *
   * @returns a set of unique grid items
   */
  getUniqueItems(): Set<T> {
    const definedCells: T[] = []

    for (const cell of this.#cells.values()) {
      if (cell.item !== undefined) {
        definedCells.push(cell.item)
      }
    }

    return new Set<T>(definedCells)
  }

  //#endregion

  //#region Find methods

  /**
   * a private method shared by other `find…()` methods
   *
   * @param {T} item  - an item potentially in the grid
   * @returns {[number, Cell<T>][]} an array of grid cell key/value pairs
   */
  #findCells(item: T): [number, Cell<T>][] {
    return [...this.#cells.entries()].filter((entry: [number, Cell<T>]) => entry[1].item === item)
  }

  /**
   *
   * @param {[number, Cell<T>]} cell - a key/value pair from the grid map
   * @param neighborhoodWatch - a cheeky name for all previously found neighbors
   * @returns
   */
  async #findNeighbors(cell: [number, Cell<T>], neighborhoodWatch?: Set<number>): Promise<Set<number>> {
    const colCount = this.#bounds.getMaxX() + 1

    const neighborKeys: NeighborKeys = {
      above: cell[0] - colCount > 1 ? cell[0] - colCount : undefined,
      below: cell[0] + colCount > 1 ? cell[0] + colCount : undefined,
      left: !Number.isInteger((cell[0] - 1) / colCount) ? cell[0] - 1 : undefined,
      right: !Number.isInteger(cell[0] / colCount) ? cell[0] + 1 : undefined,
    }

    const neighborhood = neighborhoodWatch !== undefined ? neighborhoodWatch : new Set<number>()
    neighborhood.add(cell[0])

    for (const neighborKey of Object.values(neighborKeys).map(Number)) {
      if (neighborKey !== undefined && !neighborhood.has(neighborKey)) {
        const neighbor = this.#cells.get(neighborKey)

        const addNeighbor = neighbor !== undefined && neighbor.item === cell[1].item && !neighborhood.has(neighborKey)

        if (addNeighbor) {
          neighborhood.add(neighborKey)

          const nextDoorNeighbors = await this.#findNeighbors([neighborKey, neighbor], neighborhood)

          for (const newNeighbor of nextDoorNeighbors) {
            neighborhood.add(newNeighbor)
          }
        }
      }
    }

    return neighborhood
  }

  /**
   * @param {T} item - an item potentially in the grid
   * @returns the coordinates of the all matching grid items
   */
  findPoints(item: T): Point[] {
    return this.#findCells(item).map((entry: [number, Cell<T>]) => entry[1].point)
  }

  /**
   * @param {T} item - an item potentially in the grid
   * @returns the coordinates of the first matching grid item
   */
  findPoint(item: T): Point | undefined {
    return this.findPoints(item)[0]
  }

  /**
   * @param {T} item - an item potentially in the grid
   * @returns the coordinates of the all matching grid items
   */
  async findRegions(item: T): Promise<RegionResponse<T>> {
    let cells = this.#findCells(item)
    const regions: RegionInfo[] = []

    while (cells.length > 0) {
      const firstCell = cells[0]
      const neighbors = await this.#findNeighbors(firstCell)

      regions.push({
        // points: cells.filter((entry: [number, Cell<T>]) => neighbors.has(entry[0])).map((entry: [number, Cell<T>]) => entry[1].point),
        cellNumbers: [...neighbors].sort(),
        area: 0,
        perimeter: 0,
      })

      cells = cells.filter((entry: [number, Cell<T>]) => !neighbors.has(entry[0]))
    }

    return {
      item,
      regions,
    }
  }

  //#endregion

  //#region convenience methods

  /**
   * a convenience method to easily visualize a whole grid during development.
   * pass in a filter array to only show items you want to see.
   *
   * @param {T[]} itemFilter - used to only print items in the array. other values are replaced with '.'
   */
  drawGrid(itemFilter?: T[]) {
    const numRows = this.getRowCount()

    let outputString = '\n'
    for (let rowNum = 1; rowNum <= numRows; ++rowNum) {
      let row = this.getRow(rowNum)
      if (itemFilter !== undefined) {
        row = row.map((item: T | undefined) => (item !== undefined && itemFilter.includes(item) ? item : undefined))
      }

      const rowString = row.map((item: T | undefined) => (item !== undefined ? item : '.')).join('')

      outputString += `${rowString}\n`
    }

    console.log(outputString)
  }

  //#endregion
}
