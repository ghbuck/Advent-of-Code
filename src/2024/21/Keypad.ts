import { directionToToken } from 'utils/dataTypes/conversions.js'
import { Point } from 'utils/dataTypes/index.js'
import { findAllOptimalPaths, DijkstraNode } from 'utils/models/Dijkstra.js'

export class Keypad {
  #keys: Map<string, Point>
  #pathMap: Map<string, string[]>

  constructor(keypad: string[][]) {
    this.#keys = new Map<string, Point>()
    for (const [rowIndex, row] of keypad.entries()) {
      for (const [colIndex, key] of row.entries()) {
        if (key === 'null') continue
        this.#keys.set(key, { x: colIndex, y: rowIndex })
      }
    }

    this.#pathMap = this.#createPathMap(keypad)
  }

  #createPathMap(keypad: string[][]): Map<string, string[]> {
    const pathMap = new Map<string, string[]>()

    this.#keys.forEach((key1Point, key1) => {
      this.#keys.forEach((key2Point, key2) => {
        if (!pathMap.has(`${key1},${key2}`)) {
          if (key1 === key2) {
            pathMap.set(`${key1},${key2}`, ['A'])
          } else {
            const pathsToKey = findAllOptimalPaths<string>({
              grid: keypad,
              start: { position: key1Point },
              end: key2Point,
              turnCost: 1,
              blockedSpace: 'null',
            })

            const paths = pathMap.get(`${key1},${key2}`) ?? []

            for (const pathInfo of pathsToKey) {
              const path = pathInfo.path.map(({ direction }: DijkstraNode) => directionToToken(direction))
              paths.push(path.join('') + 'A')
            }

            pathMap.set(`${key1},${key2}`, paths)
          }
        }
      })
    })

    return pathMap
  }

  getKeyPath(key1: string, key2: string): string[] {
    return this.#pathMap.get(`${key1},${key2}`) ?? []
  }
}
