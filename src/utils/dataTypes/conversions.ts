import { Point, pointsToDirections, tokenDirections } from 'utils/dataTypes/index.js'

export const directionToToken = (direction: Point | undefined): string => {
  let token = ''

  if (direction !== undefined) {
    const cardinal = pointsToDirections.get(direction)
    if (cardinal !== undefined) {
      token = tokenDirections.get(cardinal) ?? ''
    }
  }

  return token
}
