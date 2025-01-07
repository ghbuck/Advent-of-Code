import { Keypad } from './Keypad.js'

export class Robot {
  #keypad: Keypad
  #delegate: Robot | undefined
  #startingKey: string
  #currentKey: string
  #costCache: Map<string, number>

  constructor(keypad: Keypad, startingKey: string, delegate?: Robot) {
    this.#startingKey = startingKey
    this.#currentKey = startingKey

    this.#costCache = new Map<string, number>()

    this.#keypad = keypad
    this.#delegate = delegate
  }

  setDelegate(delegate: Robot) {
    this.#delegate = delegate
  }

  resetKeypad(resetKey = true) {
    this.#currentKey = resetKey ? this.#startingKey : this.#currentKey
    this.#delegate?.resetKeypad(resetKey)
  }

  pressKey = (key: string): number => {
    const cacheKey = `${this.#currentKey},${key}`

    let numKeystrokes = this.#costCache.get(cacheKey)

    if (numKeystrokes === undefined) {
      numKeystrokes = this.#makeSequenceRequest(key)
      this.#costCache.set(cacheKey, numKeystrokes)
    }

    this.#currentKey = key

    return numKeystrokes
  }

  #makeSequenceRequest(key: string): number {
    let numKeystrokes = 0
    const paths = this.#keypad.getKeyPath(this.#currentKey, key)

    if (this.#delegate) {
      const allPathsKeystrokes: number[] = []
      for (const path of paths) {
        let pathKeystrokes = 0

        for (const pathKey of path) {
          pathKeystrokes += this.#delegate?.pressKey(pathKey) ?? 0
        }

        allPathsKeystrokes.push(pathKeystrokes)
      }

      numKeystrokes += Math.min(...allPathsKeystrokes)
    } else {
      numKeystrokes = paths[0].length
    }

    return numKeystrokes
  }
}
