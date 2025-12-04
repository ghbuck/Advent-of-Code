import { Point } from '@utils/dataTypes/index.js'

export interface IBounds {
  min?: Point
  max: Point
}

/**
 * A class which currently tracks 2 dimensional boundaries
 */
export class Bounds {
  #min: Point
  #max: Point

  constructor(args?: IBounds) {
    this.#min = args?.min ?? { x: 0, y: 0 }
    this.#max = args?.max ?? { x: 0, y: 0 }
  }

  //#region Private methods

  #isGreaterOrEqualToMin(point: Point): boolean {
    return this.#min.x <= point.x && this.#min.y <= point.y
  }

  #isLesserOrEqualToMax(point: Point): boolean {
    return this.#max.x >= point.x && this.#max.y >= point.y
  }

  //#endregion

  //#region Public methods

  //#region Accessors

  get(): IBounds {
    return {
      min: this.#min,
      max: this.#max,
    }
  }

  getMin(): Point {
    return this.#min
  }

  getMinX(): number {
    return this.#min.x
  }

  getMinY(): number {
    return this.#min.y
  }

  getMax(): Point {
    return this.#max
  }

  getMaxX(): number {
    return this.#max.x
  }

  getMaxY(): number {
    return this.#max.y
  }

  //#endregion

  //#region (Re)Setters

  /**
   * Puts a point within the bounds, expanding the bounds if needed.
   * This is a non-reversible change.
   *
   * @param {Point} point - point to include
   */
  put(point: Point) {
    if (!this.isInside(point)) {
      if (!this.#isGreaterOrEqualToMin(point)) {
        this.#min.x = Math.min(this.#min.x, point.x)
        this.#min.y = Math.min(this.#min.y, point.y)
      } else if (!this.#isLesserOrEqualToMax(point)) {
        this.#max.x = Math.max(this.#max.x, point.x)
        this.#max.y = Math.max(this.#max.y, point.y)
      }
    }
  }

  /**
   * Resets the bounds to (0,0) for both min and max
   */
  clear() {
    this.#min = { x: 0, y: 0 }
    this.#max = { x: 0, y: 0 }
  }

  //#endregion

  //#region Logical methods

  isInside(point: Point): boolean {
    return this.#isGreaterOrEqualToMin(point) && this.#isLesserOrEqualToMax(point)
  }

  isInsideX(point: Point): boolean {
    return point.x >= 0 && this.#max.x >= point.x
  }

  isInsideY(point: Point): boolean {
    return point.y >= 0 && this.#max.y >= point.y
  }

  isEdgeX(point: Point): boolean {
    return point.x === this.#min.x || point.x === this.#max.x
  }

  isEdgeY(point: Point): boolean {
    return point.y === this.#min.y || point.y === this.#max.y
  }

  isEdge(point: Point): boolean {
    return this.isEdgeX(point) || this.isEdgeY(point)
  }

  //#endregion
}
