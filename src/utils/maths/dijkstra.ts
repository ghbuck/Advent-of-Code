import { MinHeap } from 'utils/models/MinHeap.js'

export interface DijkstraResult {
  movesCount: number[]
  totalMoves: number
}

export type DijkstraTuple = [number, number]

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

function isReachable(targetX: number, targetY: number, moves: DijkstraTuple[]): boolean {
  const [move1, move2] = moves
  const gcdX = gcd(move1[0], move2[0])
  const gcdY = gcd(move1[1], move2[1])

  return targetX % gcdX === 0 && targetY % gcdY === 0
}

// Example Usage
// const reachable = isReachable(12748, 12176, [[26, 66], [67, 21]]);
// if (!reachable) {
//   console.log("The target is not reachable with the given moves.");
// } else {
//   console.log("The target is reachable. Proceeding with Dijkstra's algorithm...");
// }

export function dijkstraWithMoveCounters(start: DijkstraTuple, target: DijkstraTuple, moves: DijkstraTuple[], maxMoveCount?: number): DijkstraResult | undefined {
  let result: DijkstraResult | undefined

  if (isReachable(target[0], target[1], moves)) {
    const [startX, startY] = start
    const [targetX, targetY] = target

    const heap = new MinHeap<[number, number, number[]]>() // Stores [currentX, currentY, moveCounts]
    const distances = new Map<string, number>()

    const encode = (x: number, y: number) => `${x},${y}`
    distances.set(encode(startX, startY), 0)
    heap.insert([startX, startY, Array<number>(moves.length).fill(0)], 0)

    while (!heap.isEmpty()) {
      const current = heap.extract()

      if (current === null) {
        break
      }

      const [curX, curY, moveCounts] = current.value
      const currentDistance = current.priority

      if (curX === targetX && curY === targetY) {
        result = { movesCount: moveCounts, totalMoves: currentDistance }
        break
      }

      if (maxMoveCount !== undefined && moveCounts.findIndex((moveCount: number) => moveCount > maxMoveCount) !== -1) {
        break
      }

      for (let i = 0; i < moves.length; i++) {
        const [dx, dy] = moves[i]
        const nextX = curX + dx
        const nextY = curY + dy
        const nextDistance = currentDistance + 1

        const key = encode(nextX, nextY)
        const nextMoveCounts = [...moveCounts]
        nextMoveCounts[i] += 1

        if (!distances.has(key) || nextDistance < (distances.get(key) ?? 0)) {
          distances.set(key, nextDistance)
          heap.insert([nextX, nextY, nextMoveCounts], nextDistance)
        }
      }
    }
  }

  return result
}
