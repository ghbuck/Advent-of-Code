import { Point } from './interfaces.js'
import { CardinalDirection } from './types.js'

export * from './interfaces.js'
export * from './types.js'

export const cardinalDirections = new Map<CardinalDirection, Point>([
  ['north', { x: 0, y: -1 }],
  ['south', { x: 0, y: 1 }],
  ['east', { x: 1, y: 0 }],
  ['west', { x: -1, y: 0 }],
])

export const tokenDirections = new Map<CardinalDirection, string>([
  ['north', '^'],
  ['south', 'v'],
  ['east', '>'],
  ['west', '<'],
])
