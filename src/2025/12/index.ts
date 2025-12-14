import { Dimensions, RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface ShapeRotation {
  grid: string[][]
  width: number
  length: number
}

interface ShapeInfo {
  area: number
  rotations: ShapeRotation[]
}

interface ShapeInstance {
  shapeId: number
  shape: ShapeInfo
  area: number
  uniqueRotations: ShapeRotation[]
}

interface RegionInfo {
  width: number
  length: number
  shapeNeeds: Map<number, number>
}

interface BacktrackingStaticParams {
  regionGrid: boolean[][]
  region: RegionInfo
  instances: ShapeInstance[]
}

//======= Input Parsing =======//

const getShapeDimensions = (grid: string[][]): Dimensions => {
  let minRow = grid.length,
    maxRow = -1
  let minCol = grid[0].length,
    maxCol = -1

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === '#') {
        minRow = Math.min(minRow, i)
        maxRow = Math.max(maxRow, i)
        minCol = Math.min(minCol, j)
        maxCol = Math.max(maxCol, j)
      }
    }
  }

  return {
    length: maxRow - minRow + 1,
    width: maxCol - minCol + 1,
  }
}

const rotateGrid = (grid: string[][]): string[][] => {
  const rows = grid.length
  const cols = grid[0].length

  const rotated: string[][] = Array<string>(cols)
    .fill('')
    .map(() => Array<string>(rows).fill('.'))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = grid[i][j]
    }
  }

  return rotated
}

const getAllRotationsWithDimensions = (grid: string[][]): ShapeRotation[] => {
  const rotations: ShapeRotation[] = []
  let current = grid

  // Add original orientation
  const dims = getShapeDimensions(current)
  rotations.push({
    grid: current,
    length: dims.length,
    width: dims.width,
  })

  // Add 3 more rotations (90°, 180°, 270°)
  for (let i = 0; i < 3; i++) {
    current = rotateGrid(current)
    const rotatedDims = getShapeDimensions(current)

    rotations.push({
      grid: structuredClone(current),
      length: rotatedDims.length,
      width: rotatedDims.width,
    })
  }

  return rotations
}

const parseInput = (input: string): [ShapeInfo[], RegionInfo[]] => {
  const shapeRegex = new RegExp(/(\d+):\n((?:[.#]+?\n){3})/g)
  const regionRegex = new RegExp(/(\d+)x(\d+): (.+)/g)

  const shapes = input.matchAll(shapeRegex)
  const regions = input.matchAll(regionRegex)

  const shapesInfo: ShapeInfo[] = []
  for (const shape of shapes) {
    const [, , shapeData] = shape
    const grid = shapeData
      .trim()
      .split('\n')
      .map((line) => line.split(''))

    const shapeArea = grid.reduce((sum, row) => sum + row.filter((cell) => cell === '#').length, 0)
    const rotations = getAllRotationsWithDimensions(grid)

    shapesInfo.push({
      area: shapeArea,
      rotations,
    })
  }

  const regionInfo: RegionInfo[] = []
  for (const region of regions) {
    const [, width, length, regionData] = region

    const shapeNeeds = new Map<number, number>()
    for (const [index, char] of regionData.split(' ').entries()) {
      shapeNeeds.set(index, Number(char))
    }

    regionInfo.push({
      length: Number(length),
      width: Number(width),
      shapeNeeds,
    })
  }

  return [shapesInfo, regionInfo]
}

//======= Core Logic =======//

const initializeShapeInstances = (shapesInfo: ShapeInfo[], shapesToPlace: [number, number][]): ShapeInstance[] => {
  const instances: ShapeInstance[] = []

  for (const [shapeId, count] of shapesToPlace) {
    const shape = shapesInfo[shapeId]

    // Deduplicate rotations for this shape
    const uniqueRotations: ShapeRotation[] = []
    const seen = new Set()

    for (const rotation of shape.rotations) {
      const key = rotation.grid.map((row) => row.join('')).join('|')
      if (!seen.has(key)) {
        seen.add(key)
        uniqueRotations.push(rotation)
      }
    }

    for (let i = 0; i < count; i++) {
      instances.push({ shapeId, shape, area: shape.area, uniqueRotations })
    }
  }

  // Sort by area (largest first) for better pruning
  instances.sort((a, b) => b.area - a.area)

  return instances
}

//======= Space checking =======//

// Fast constraint checking: area remaining vs shapes left
const hasEnoughSpace = (grid: boolean[][], remainingShapes: number, remainingArea: number): boolean => {
  if (remainingArea <= 0 && remainingShapes > 0) return false

  let freeSpace = 0
  for (const row of grid) {
    for (const col of row) {
      if (!col) freeSpace++
    }
  }

  return freeSpace >= remainingArea
}

// Check if a shape can be placed at a specific position in the grid
const canPlaceShape = (grid: boolean[][], shapeGrid: string[][], row: number, col: number): boolean => {
  const shapeHeight = shapeGrid.length
  const shapeWidth = shapeGrid[0].length

  // Check bounds
  if (row + shapeHeight > grid.length || col + shapeWidth > grid[0].length) {
    return false
  }

  // Check for overlaps
  for (let i = 0; i < shapeHeight; i++) {
    for (let j = 0; j < shapeWidth; j++) {
      if (shapeGrid[i][j] === '#' && grid[row + i][col + j]) {
        return false
      }
    }
  }

  return true
}

//======= Shape placement =======//

// Place a shape on the grid
const placeShape = (grid: boolean[][], shapeGrid: string[][], row: number, col: number): void => {
  for (let i = 0; i < shapeGrid.length; i++) {
    for (let j = 0; j < shapeGrid[i].length; j++) {
      if (shapeGrid[i][j] === '#') {
        grid[row + i][col + j] = true
      }
    }
  }
}

// Remove a shape from the grid
const removeShape = (grid: boolean[][], shapeGrid: string[][], row: number, col: number): void => {
  for (let i = 0; i < shapeGrid.length; i++) {
    for (let j = 0; j < shapeGrid[i].length; j++) {
      if (shapeGrid[i][j] === '#') {
        grid[row + i][col + j] = false
      }
    }
  }
}

//======= Backtracking Fitting Algorithm =======//

const backtrackShapePlacement = (
  instanceIndex: number,
  remainingArea: number,
  { regionGrid, region, instances }: BacktrackingStaticParams,
): boolean => {
  // All instances placed
  if (instanceIndex >= instances.length) {
    return true
  }

  // Constraint check: do we have enough free space?
  if (!hasEnoughSpace(regionGrid, instances.length - instanceIndex, remainingArea)) {
    return false
  }

  const instance = instances[instanceIndex]

  // Try each unique rotation
  for (const rotation of instance.uniqueRotations) {
    for (let row = 0; row <= region.length - rotation.length; row++) {
      for (let col = 0; col <= region.width - rotation.width; col++) {
        if (canPlaceShape(regionGrid, rotation.grid, row, col)) {
          placeShape(regionGrid, rotation.grid, row, col)

          if (backtrackShapePlacement(instanceIndex + 1, remainingArea - instance.area, { regionGrid, region, instances })) {
            return true
          }

          removeShape(regionGrid, rotation.grid, row, col)
        }
      }
    }
  }

  return false
}

const canFitAllShapes = (shapesInfo: ShapeInfo[], region: RegionInfo, shapesToPlace: [number, number][], totalAreaToPlace: number): boolean => {
  if (shapesToPlace.length === 0) return true

  // Initialize empty region grid
  const regionGrid = Array(region.length)
    .fill(null)
    .map(() => Array<boolean>(region.width).fill(false))

  // Create list of all shape instances with precomputed rotations
  const instances = initializeShapeInstances(shapesInfo, shapesToPlace)

  return backtrackShapePlacement(0, totalAreaToPlace, { regionGrid, region, instances })
}

//======= Main Processing Function =======//

const processRegions = ([shapesInfo, regionInfo]: [ShapeInfo[], RegionInfo[]]): number => {
  let numRegionsFit = 0

  for (const region of regionInfo) {
    // Early elimination checks
    let totalShapeArea = 0

    for (const [shapeId, count] of region.shapeNeeds) {
      if (count === 0) continue

      const shape = shapesInfo[shapeId]
      if (shape) {
        totalShapeArea += shape.area * count
      }
    }

    // Early elimination: area check
    if (totalShapeArea > region.width * region.length) {
      continue
    }

    // If simple checks pass, try more complex fitting
    // Sort shapes by area (largest first) for better pruning
    const sortedShapes = Array.from(region.shapeNeeds.entries()).toSorted((a, b) => {
      const areaA = shapesInfo[a[0]].area * a[1]
      const areaB = shapesInfo[b[0]].area * b[1]
      return areaB - areaA
    })

    if (canFitAllShapes(shapesInfo, region, sortedShapes, totalShapeArea)) {
      numRegionsFit++
    }
  }

  return numRegionsFit
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 2 : 512,
    part2: params.isTest ? undefined : undefined,
  }

  const data = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? processRegions(data) : undefined,
    solution,
  })
}
