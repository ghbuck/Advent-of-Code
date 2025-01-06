import { CardinalDirection, Point, pointsToDirections, tokenDirections } from '@utils/dataTypes/index.js'

export const directionToToken = (direction: Point | undefined): string => {
  let token = ''

  if (direction !== undefined) {
    const cardinal = pointsToDirections.get(`${direction.x},${direction.y}`)
    if (cardinal !== undefined) {
      token = tokenDirections.get(cardinal) ?? ''
    }
  }

  return token
}

export const getCardinalDirection = (direction: Point | undefined): CardinalDirection => {
  return (direction !== undefined ? pointsToDirections.get(`${direction.x},${direction.y}`) : undefined) ?? 'north'
}
