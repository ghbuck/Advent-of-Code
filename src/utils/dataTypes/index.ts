import { Point } from './interfaces.js'
import { CardinalDirection } from './types.js'

export * from './conversions.js'
export * from './interfaces.js'
export * from './types.js'

export const cardinalDirections = new Map<CardinalDirection, Point>([
  ['north', { x: 0, y: -1 }],
  ['south', { x: 0, y: 1 }],
  ['east', { x: 1, y: 0 }],
  ['west', { x: -1, y: 0 }],
])

export const pointsToDirections = new Map<string, CardinalDirection>()
for (const [key, value] of cardinalDirections) {
  pointsToDirections.set(`${value.x},${value.y}`, key)
}

export const tokenDirections = new Map<CardinalDirection, string>([
  ['north', '^'],
  ['south', 'v'],
  ['east', '>'],
  ['west', '<'],
])

export const tokensToDirections = new Map<string, CardinalDirection>()
for (const [key, value] of tokenDirections) {
  tokensToDirections.set(value, key)
}

export const northPrioritizedDirections: [CardinalDirection, Point][] = [
  ['north', { x: 0, y: -1 }],
  ['east', { x: 1, y: 0 }],
  ['west', { x: -1, y: 0 }],
  ['south', { x: 0, y: 1 }],
]

export const southPrioritizedDirections: [CardinalDirection, Point][] = [
  ['south', { x: 0, y: 1 }],
  ['east', { x: 1, y: 0 }],
  ['west', { x: -1, y: 0 }],
  ['north', { x: 0, y: -1 }],
]

export const eastPrioritizedDirections: [CardinalDirection, Point][] = [
  ['east', { x: 1, y: 0 }],
  ['north', { x: 0, y: -1 }],
  ['south', { x: 0, y: 1 }],
  ['west', { x: -1, y: 0 }],
]

export const westPrioritizedDirections: [CardinalDirection, Point][] = [
  ['west', { x: -1, y: 0 }],
  ['north', { x: 0, y: -1 }],
  ['south', { x: 0, y: 1 }],
  ['east', { x: 1, y: 0 }],
]
