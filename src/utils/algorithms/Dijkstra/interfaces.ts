import { CardinalDirection, Point } from '@utils/dataTypes/index.js'
import { Bounds } from '@utils/models/Bounds.js'

export interface DijkstraNode {
  position: Point
  cost: number
  direction?: Point
}

export interface DijkstraNodeV2 extends DijkstraNode {
  previous: DijkstraNodeV2 | undefined
}

export type DijkstraStartNode = Omit<DijkstraNode | DijkstraNodeV2, 'cost'>

export interface DijkstraParams<T> {
  grid: T[][]
  start: DijkstraStartNode | T
  end: Point | T
  turnCost?: number
  turnCostCalculator?: (dirKey: CardinalDirection) => number
  moveCostCalculator?: (dirKey: CardinalDirection) => number
  freeSpace?: T
  blockedSpace?: T
  doAnimation?: boolean
}

export interface DijkstraDirectionHandlerParams {
  current: DijkstraNode
  currentV2: DijkstraNodeV2
  newPosition: Point
  newCost: number
  extraCost: number
  direction: Point
}

export interface DijkstraDirectionParams<T> extends Omit<DijkstraParams<T>, 'start' | 'end' | 'doAnimation'> {
  current: DijkstraNode | DijkstraNodeV2
  bounds: Bounds
  endChar: T
  loggingGrid: string[][]
  handler: (params: DijkstraDirectionHandlerParams) => boolean
}

export interface DijkstraResults {
  path: DijkstraNode[]
  cost: number
}
