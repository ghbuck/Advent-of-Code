import kleur from 'kleur'
import { Point } from 'utils/dataTypes/index.js'
import { Bounds, IBounds } from 'utils/models/Bounds.js'

export interface IGrid<T> {
  input: string
  splitter1: string
  splitter2: string
  typeConstructor: () => T
}

export interface DrawGridParams<T> {
  filter?: T[]
  replacer?: string
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

type NeighborLocation = 'above' | 'below' | 'left' | 'right'
type NeighborhoodMap = Map<NeighborLocation, number | undefined>

interface Cell<T> {
  items: T[]
  point: Point
  neighbors: NeighborhoodMap
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

  /**
   *
   * @param {Point} point - the coordinates to retrieve
   * @returns {T[]} the items array, if it exists, otherwise `undefined`
   */
  getCellItems(point: Point): T[] | undefined {
    return [...this.#cells.values()].filter((cell: Cell<T>) => cell.point.x === point.x && cell.point.y === point.y).map((cell: Cell<T>) => cell.items)[0]
  }

  /**
   * a useful method for when you need to do things with
   *
   * @returns a set of unique grid items
   */
  getUniqueItems(): Set<T> {
    const definedCells: T[][] = []

    for (const cell of this.#cells.values()) {
      if (cell.items !== undefined) {
        definedCells.push(cell.items)
      }
    }

    return new Set<T>(definedCells.flatMap((items: T[]) => items))
  }

  /**
   * Puts an item on the grid.
   *
   * @param {T} item
   * @param {Point} point = the desired coordinates
   * @throws {Error} if the new item would be placed out of bounds
   */
  putItem(item: T, point: Point) {
    if (!this.#bounds.isInside(point)) {
      throw new Error(kleur.red(`The requested point, ${JSON.stringify(point)}, is outside the bounds of the grid, ${JSON.stringify(this.#bounds.getMax())}.`))
    }

    const cellNum = this.getColumnCount() * point.y + point.x + 1
    let items: T[] = [item]

    const exitingCell = this.#cells.get(cellNum)
    if (exitingCell !== undefined) {
      items = [...items, ...exitingCell.items]
    }

    this.#cells.set(cellNum, {
      items,
      point,
      neighbors: new Map<NeighborLocation, number | undefined>(),
    })
  }

  /**
   *
   */
  deleteItem(point: Point) {
    const cellNum = [...this.#cells.entries()].filter((entry: [number, Cell<T>]) => entry[1].point.x === point.x && entry[1].point.y === point.y).map((entry: [number, Cell<T>]) => entry[0])[0]
    this.#cells.delete(cellNum)
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
    return [...this.#cells.entries()].filter((entry: [number, Cell<T>]) => entry[1].items.includes(item))
  }

  /**
   * a private method used to get the keys for adjacent cells in the grid
   *
   * @param {number} cellKey
   * @returns {NeighborhoodMap} a map of <NeighborLocation, neighbor cell key>
   */
  #mapTheNeighborhood(cellKey: number): NeighborhoodMap {
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

    const theMap = this.#mapTheNeighborhood(cellKey)
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
   * @param {Cell<T>} checkCell
   */
  #checkForNewSides(checkCell: Cell<T>): number {
    // garbage just to quiet eslint
    const test = checkCell.point.x
    return test
  }

  #calculateRegionInfo(cells: Set<number>): RegionInfo {
    let perimeter = 0
    let sides = 0

    const sortedCells = [...cells].sort((a, b) => a - b)

    for (const cellKey of sortedCells) {
      const cell = this.#cells.get(cellKey)

      if (cell !== undefined) {
        const definedNeighbors = [...cell.neighbors.entries()].filter((entry: [NeighborLocation, number | undefined]) => entry[1] !== undefined)
        const exposedEdges = 4 - definedNeighbors.length

        perimeter += exposedEdges
        sides += this.#checkForNewSides(cell)
      }
    }

    return {
      cellNumbers: sortedCells,
      area: sortedCells.length,
      perimeter,
      sides,
    }
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

  //#endregion

  //#region Utility methods

  /**
   * A utility method to easily visualize a whole grid during development.
   *
   * Pass in the `args` object to only show items you want to see.
   *
   * @param {DrawGridParams} args - used to manipulate the output drawing
   */
  drawGrid(args?: DrawGridParams<T>) {
    const numRows = this.getRowCount()
    const numCols = this.getColumnCount()

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

      let newRow = []
      if (args?.replacer !== undefined) {
        if (args.replacer === '\\d') {
          newRow = row.map((items: T[]) => (items.length > 0 ? items.length.toFixed() : '.'))
        } else {
          newRow = row.map((items: T[]) => (items.length > 0 ? args.replacer : '.'))
        }
      } else {
        newRow = row.map((items: T[]) => (items.length > 0 ? items.join('') : '.'))
      }

      let rowString = ''
      for (let index = 0; index <= numCols; ++index) {
        rowString += newRow[index] ?? '.'
      }

      outputString += `${rowString}\n`
    }

    console.log(outputString)
  }

  //#endregion
}
