import { Point } from '@utils/dataTypes/index.js'
import { Bounds, IBounds } from '@utils/models/Bounds.js'

import { clearScreen } from 'ansi-escapes'
import kleur from 'kleur'

export interface IGrid<T> {
  input: string
  splitter1: string
  splitter2: string
  typeConstructor: () => T
}

export interface DrawGridParams<T> {
  filter?: T[]
  replacer?: string
  onlyTopItem?: boolean
  animationTimeout?: number
}

export interface RegionInfo {
  cellNumbers: number[]
  area: number
  perimeter: number
  sides: number
}

export interface RegionResponse<T> {
  item: T
  regions: RegionInfo[]
}

export type NeighborLocation = 'above' | 'below' | 'left' | 'right'
export type NeighborhoodMap = Map<NeighborLocation, number | undefined>

export type ShiftDirection = NeighborLocation

interface Cell<T> {
  items: T[]
  point: Point
  neighbors: NeighborhoodMap
}

interface SideInfo<T> {
  cell: Cell<T>
  cellKey: number
  direction: NeighborLocation
  counted: boolean
}

export class Grid<T> {
  #cells: Map<number, Cell<T>>
  #bounds: Bounds

  //#region Constructors

  constructor(args?: IGrid<T>) {
    this.#cells = new Map<number, Cell<T>>()
    this.#bounds = new Bounds()

    if (args !== undefined) {
      this.setGrid(args)
    }
  }

  /**
   * If you've instantiated the grid without input you may call this method.
   *
   * **!Warning¡** this is a destructive procedure if you already have cells in this grid
   *
   * @param {IGrid<T>} args - the input string, splitters, and typeConstructor needed to generate the grid
   */
  setGrid(args: IGrid<T>) {
    this.#cells.clear()
    this.#bounds.clear()

    const inputArray = args.input.split(args.splitter1).map((row: string) => row.split(args.splitter2).map(args.typeConstructor))

    this.#bounds.put({
      x: inputArray.reduce((longestRow, row) => (row.length > longestRow.length ? row : longestRow), []).length - 1,
      y: inputArray.length - 1,
    })

    let counter = 0
    for (let rowIndex = 0; rowIndex <= this.#bounds.getMaxY(); ++rowIndex) {
      for (let colIndex = 0; colIndex <= this.#bounds.getMaxX(); ++colIndex) {
        this.#cells.set(++counter, {
          items: [inputArray[rowIndex][colIndex]],
          point: {
            x: colIndex,
            y: rowIndex,
          },
          neighbors: new Map<NeighborLocation, number>(),
        })
      }
    }
  }

  //#endregion

  //#region Bounds methds

  getBounds(): Bounds {
    return this.#bounds
  }

  /**
   * If you've instantiated the grid without input and only want to size the grid you may call this method.
   *
   * **!Warning¡** this is a destructive procedure if you already have cells in this grid
   *
   * @param {IBounds} newBounds - the bounds of the
   */
  setBounds(newBounds: IBounds) {
    this.#cells.clear()
    this.#bounds.clear()
    this.#bounds.put(newBounds.max)
  }

  //#endregion

  //#region Row methods

  /**
   *
   * @param {T} rowNum - the row to access (i.e.: 1 = first row)
   * @returns the column map for the requested row
   */
  getRow(rowNum: number): T[][] {
    const colCount = this.#bounds.getMaxX() + 1
    const row: T[][] = Array<T[]>(colCount)

    if (rowNum > 0 && rowNum <= this.#bounds.getMaxY() + 1) {
      for (const [key, value] of this.#cells) {
        const comparator = key / colCount
        if (comparator > rowNum - 1 && comparator <= rowNum) {
          row[value.point.x] = value.items
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
      const key = counter++
      const item = items?.[colIndex]

      if (item !== undefined) {
        this.#cells.set(key, {
          items: [item],
          point: {
            x: colIndex,
            y: this.#bounds.getMaxY(),
          },
          neighbors: new Map<NeighborLocation, number>(),
        })
      }
    }
  }

  //#endregion

  //#region Column methods

  /**
   *
   * @param colNum - the column to access (i.e.: 1 = first column)
   * @returns an array of sliced column values
   */
  getColumn(colNum: number): T[][] {
    const col: T[][] = []

    const colCount = this.#bounds.getMaxX() + 1
    if (colNum > 0 && colNum <= colCount) {
      const checkValue = colNum === colCount ? 0 : colNum / colCount

      for (const [key, value] of this.#cells) {
        const calcValue = key / colCount - Math.floor(key / colCount)

        if (calcValue.toFixed(10) === checkValue.toFixed(10)) {
          col.push(value.items)
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

  getCellKey(point: Point): number | undefined {
    return [...this.#cells.entries()]
      .filter((entry: [number, Cell<T>]) => entry[1].point.x === point.x && entry[1].point.y === point.y)
      .map((entry: [number, Cell<T>]) => entry[0])[0]
  }

  /**
   *
   * @param {Point} point - the coordinates to retrieve
   * @returns {T[]} the items array, if it exists, otherwise `undefined`
   */
  getCellItems(point: Point): T[] | undefined {
    return [...this.#cells.values()]
      .filter((cell: Cell<T>) => cell.point.x === point.x && cell.point.y === point.y)
      .map((cell: Cell<T>) => cell.items)[0]
  }

  getCellItemsByKey(cellKey: number): T[] | undefined {
    return [...this.#cells.entries()]
      .filter((entry: [number, Cell<T>]) => entry[0] === cellKey)
      .map((entry: [number, Cell<T>]) => entry[1].items)
      .flat()
  }

  /**
   * a useful method for when you need to do things with
   *
   * @returns an array of all grid items
   */
  getAllItems(): T[] {
    const definedCells: T[][] = []

    for (const cell of this.#cells.values()) {
      if (cell.items.length > 0) {
        definedCells.push(cell.items)
      }
    }

    return definedCells.flatMap((items: T[]) => items)
  }

  /**
   * a useful method for when you need to do things with
   *
   * @returns a set of unique grid items
   */
  getUniqueItems(): Set<T> {
    return new Set<T>(this.getAllItems())
  }

  /**
   * Puts an item on the grid.
   *
   * @param {T} item
   * @param {Point} location = the desired coordinates
   * @throws {Error} if the new item would be placed out of bounds
   */
  putItem(item: T, location: Point | number) {
    let cellNum = 0
    let cellPoint: Point = { x: 0, y: 0 }

    if (typeof location === 'number') {
      cellNum = location
      cellPoint = this.#cells.get(cellNum)?.point ?? { x: 0, y: 0 }
    } else {
      if (!this.#bounds.isInside(location)) {
        throw new Error(
          kleur.red(`The requested point, ${JSON.stringify(location)}, is outside the bounds of the grid, ${JSON.stringify(this.#bounds.getMax())}.`),
        )
      }

      cellNum = this.getColumnCount() * location.y + location.x + 1
      cellPoint = location
    }

    let items: T[] = [item]

    const exitingCell = this.#cells.get(cellNum)
    if (exitingCell !== undefined) {
      items = [...items, ...exitingCell.items]
    }

    this.#cells.set(cellNum, {
      items,
      point: cellPoint,
      neighbors: new Map<NeighborLocation, number | undefined>(),
    })
  }

  /**
   *
   */
  deleteItem(item: T, location: Point | number) {
    let cellNum = 0
    if (typeof location === 'number') {
      cellNum = location
    } else {
      cellNum = [...this.#cells.entries()]
        .filter((entry: [number, Cell<T>]) => entry[1].point.x === location.x && entry[1].point.y === location.y)
        .map((entry: [number, Cell<T>]) => entry[0])[0]
    }

    const cell = this.#cells.get(cellNum)

    if (cell !== undefined) {
      const itemIndex = cell.items.findIndex((cellItem: T) => cellItem === item)
      if (itemIndex !== -1) {
        cell.items.splice(itemIndex, 1)
      }
    }
  }

  /**
   *
   */
  deleteItems(point: Point) {
    const cellNum = [...this.#cells.entries()]
      .filter((entry: [number, Cell<T>]) => entry[1].point.x === point.x && entry[1].point.y === point.y)
      .map((entry: [number, Cell<T>]) => entry[0])[0]
    this.#cells.delete(cellNum)
  }

  // shiftItemsByCellKey(startKey: number, numCells: number, deltaValue: number, shiftValue: number) {
  //   const endKey = startKey + (numCells * deltaValue)
  //   const cells: [number, Cell<T>] = [...this.#cells.entries()].slice(Math.m)

  // }

  //#endregion

  //#region Find methods

  /**
   * a private method shared by other `find…()` methods
   *
   * @param {T} item  - an item potentially in the grid
   * @returns {[number, Cell<T>][]} an array of grid cell key/value pairs
   */
  #findCells(item: T): [number, Cell<T>][] {
    return [...this.#cells.entries()].filter((entry: [number, Cell<T>]) => entry[1].items.includes(item))
  }

  /**
   * a method used to get the keys for adjacent cells in the grid
   *
   * @param {number} cellKey
   * @returns {NeighborhoodMap} a map of <NeighborLocation, neighbor cell key>
   */
  mapTheNeighborhood(cellKey: number): NeighborhoodMap {
    const colCount = this.#bounds.getMaxX() + 1

    const neighborhoodMap: NeighborhoodMap = new Map<NeighborLocation, number>()
    if (cellKey - colCount > 0) {
      neighborhoodMap.set('above', cellKey - colCount)
    }
    if (cellKey + colCount <= this.#cells.size) {
      neighborhoodMap.set('below', cellKey + colCount)
    }
    if (!Number.isInteger((cellKey - 1) / colCount)) {
      neighborhoodMap.set('left', cellKey - 1)
    }
    if (!Number.isInteger(cellKey / colCount)) {
      neighborhoodMap.set('right', cellKey + 1)
    }

    const cell = this.#cells.get(cellKey)
    if (cell !== undefined) {
      cell.neighbors = neighborhoodMap
    }

    return neighborhoodMap
  }

  /**
   *
   * @param {number} cell - the home cell
   * @param {NeighborhoodMap} neighborhoodMap - the map of its neighbors
   * @returns {NeighborhoodMap} a filtered copy of `neighborhoodMap`
   */
  #filterTheNeighborhood(cell: Cell<T>, neighborhoodMap: NeighborhoodMap, visited: Set<number>): NeighborhoodMap {
    const matchingNeighbors: NeighborhoodMap = new Map<NeighborLocation, number>()

    neighborhoodMap.forEach((neighborKey: number | undefined, location: NeighborLocation) => {
      if (neighborKey !== undefined) {
        const neighborItems = this.#cells.get(neighborKey)?.items

        if (neighborItems === undefined || neighborItems.length === 0) {
          cell.neighbors.set(location, undefined)
        } else {
          let neighborFound = false
          for (const item of neighborItems) {
            neighborFound = cell.items.includes(item)
            if (neighborFound) {
              break
            }
          }

          if (neighborFound && !visited.has(neighborKey)) {
            matchingNeighbors.set(location, neighborKey)
          }
        }
      }
    })

    return matchingNeighbors
  }

  /**
   *
   * @param {[number, Cell<T>]} cell - a key/value pair from the grid map
   * @param visited - a cheeky name for all previously found neighbors
   * @returns
   */
  async #findMatchingNeighbors([cellKey, cell]: [number, Cell<T>], visited?: Set<number>): Promise<Set<number>> {
    const localVisited = visited !== undefined ? visited : new Set<number>()
    localVisited.add(cellKey)

    const theMap = this.mapTheNeighborhood(cellKey)
    const matchingNeighbors = this.#filterTheNeighborhood(cell, theMap, localVisited)

    return Promise.all(
      [...matchingNeighbors.values()].map((neighborKey: number | undefined) => {
        if (neighborKey !== undefined) {
          const neighbor = this.#cells.get(neighborKey)
          if (neighbor !== undefined) {
            localVisited.add(neighborKey)
            return this.#findMatchingNeighbors([neighborKey, neighbor], localVisited)
          }
        }
      }),
    ).then((newNeighborMaps: (Set<number> | undefined)[]) => {
      for (const newNeighborMap of newNeighborMaps) {
        if (newNeighborMap !== undefined) {
          for (const newNeighbor of newNeighborMap) {
            localVisited.add(newNeighbor)
          }
        }
      }

      return localVisited
    })
  }

  /**
   * Checks a cell and its neighbors to see if we have found a new side
   *
   * This was a fun one to figure out. The key was creating the SideInfo interface.
   * This way I could iterate over the cells with exposed edges and only count new ones as a side.
   * The key line is the `info.filter()`.
   *
   * @param {SideInfo<T>[]} info - the side information for the region
   */
  #countSides(info: SideInfo<T>[]): number {
    if (info.length === 1) {
      return 4
    } else {
      let sides = 0

      for (const side of info) {
        if (!side.counted) {
          sides++
          side.counted = true
        }

        for (const neighborCellKey of side.cell.neighbors.values()) {
          const neighborSides = info.filter((entry: SideInfo<T>) => entry.cellKey === neighborCellKey && entry.direction === side.direction)
          for (const neighborSide of neighborSides) {
            neighborSide.counted = true
          }
        }
      }

      return sides
    }
  }

  /**
   *
   * @param {Set<number>} cells - a set of all item cells in the region
   * @returns {RegionInfo} a RegionInfo object with area, perimeter, and side count
   */
  #calculateRegionInfo(cells: Set<number>): RegionInfo {
    let perimeter = 0

    const sortedCells = [...cells].sort((a, b) => a - b)
    const neighborDirections: NeighborLocation[] = ['above', 'right', 'below', 'left']

    const sideInfo: SideInfo<T>[] = []

    for (const cellKey of sortedCells) {
      const cell = this.#cells.get(cellKey)

      if (cell !== undefined) {
        let definedAndMatchingNeighbors = 0

        for (const direction of neighborDirections) {
          const neighborKey = cell.neighbors.get(direction)
          if (neighborKey !== undefined && cells.has(neighborKey)) {
            ++definedAndMatchingNeighbors
          } else {
            sideInfo.push({ cell, cellKey, direction, counted: false })
          }
        }

        const exposedEdges = 4 - definedAndMatchingNeighbors
        perimeter += exposedEdges
      }
    }

    return {
      cellNumbers: sortedCells,
      area: sortedCells.length,
      perimeter,
      sides: this.#countSides(sideInfo),
    }
  }

  /**
   * @param {T} item - an item potentially in the grid
   * @returns {RegionResponse<T>} the item along with a RegionInfo object
   */
  async findRegions(item: T): Promise<RegionResponse<T>> {
    let cells = this.#findCells(item)
    const regions: RegionInfo[] = []

    while (cells.length > 0) {
      const firstCell = cells[0]

      const regionCells = await this.#findMatchingNeighbors(firstCell)
      const regionInfo = this.#calculateRegionInfo(regionCells)

      regions.push(regionInfo)

      cells = cells.filter((entry: [number, Cell<T>]) => !regionCells.has(entry[0]))
    }

    return {
      item,
      regions,
    }
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
  findCellNumbers(item: T): number[] {
    return this.#findCells(item).map((entry: [number, Cell<T>]) => entry[0])
  }

  /**
   * @param {T} item - an item potentially in the grid
   * @returns the cell number of the first matching grid item
   */
  findCellNumber(item: T): number | undefined {
    return this.findCellNumbers(item)[0]
  }

  //#endregion

  //#region Utility methods

  /**
   * A utility method to easily visualize a whole grid during development.
   *
   * Pass in the `args` object to only show items you want to see.
   *
   * @param {DrawGridParams} args - used to manipulate the output drawing
   * @returns {string} if you would like to manipulate the string for some reason
   */
  drawGrid(args?: DrawGridParams<T>): string {
    const numRows = this.getRowCount()

    let outputString = '\n'
    for (let rowNum = 1; rowNum <= numRows; ++rowNum) {
      let row = this.getRow(rowNum)

      if (args?.filter !== undefined) {
        row = row.map((items: T[]) => {
          let itemFound = false
          for (const item of items) {
            itemFound = args.filter !== undefined && args.filter.includes(item)
            if (itemFound) {
              break
            }
          }
          return itemFound ? items : []
        })
      }

      let newRow: string[] = []
      if (args?.replacer !== undefined) {
        if (args.replacer === '\\d') {
          newRow = row.map((items: T[]) => (items.length > 0 ? items.length.toFixed() : '.'))
        } else {
          newRow = row.map((items: T[]) => (items.length > 0 && args.replacer !== undefined ? args.replacer : '.'))
        }
      } else {
        if (args?.onlyTopItem) {
          newRow = row.map((items: T[]) => (items.length > 0 ? items[0] + '' : '.'))
        } else {
          newRow = row.map((items: T[]) => (items.length > 1 ? `[${items.join(',')}]` : items.length === 1 ? items[0] + '' : '.'))
        }
      }

      let rowString = ''
      for (let index = 0; index <= this.#bounds.getMaxX(); ++index) {
        rowString = `${rowString}${newRow[index] ?? '.'}`
      }

      outputString += `${rowString}\n`
    }

    process.stdout.write(clearScreen + kleur.cyan(outputString))

    if (args?.animationTimeout !== undefined) {
      const start = Date.now()
      let now = start
      while (now - start < args.animationTimeout) {
        now = Date.now()
      }
    }

    return outputString
  }

  /**
   * I've decided to use the Manhattan distance here. God, I love learning math during AoC!
   *
   * @param distance the comparator, below which we consider items sufficiently clustered
   * @returns
   */
  clusteredWithinDistance(distance: number): boolean {
    let totalDistance = 0
    let comparisons = 0

    for (const cell1 of this.#cells.values()) {
      for (const cell2 of this.#cells.values()) {
        totalDistance += Math.abs(cell2.point.x - cell1.point.x) + Math.abs(cell2.point.y - cell1.point.y)
        ++comparisons
      }
    }

    return totalDistance / comparisons <= distance
  }

  //#endregion
}
