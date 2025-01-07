import { getKey, getSharedInfo, pointsAreEqual, processDirections, reconstructPath } from '@utils/algorithms/Dijkstra/helpers.js'
import { DijkstraDirectionHandlerParams, DijkstraNode, DijkstraParams, DijkstraResults } from '@utils/algorithms/Dijkstra/interfaces.js'
import { PriorityQueue } from '@utils/models/PriorityQueue.js'

export const findPaths = <T>(params: DijkstraParams<T>): DijkstraResults[] => {
  const results: DijkstraResults[] = []

  const visited = new Set<string>()
  const queue = new PriorityQueue<DijkstraNode>()
  const parentMap = new Map<string, DijkstraNode>()

  const [bounds, startNode, endPoint, endChar, loggingGrid] = getSharedInfo(params.grid, params.start, params.end)

  const directionHandler = ({ current, newPosition, newCost, direction }: DijkstraDirectionHandlerParams) => {
    let doAnimation = false

    const newNode: DijkstraNode = { position: newPosition, cost: newCost, direction: direction }
    const newKey = getKey(newNode)

    if (!visited.has(newKey)) {
      queue.enqueue(newNode, newCost)
      parentMap.set(newKey, current)
      doAnimation = params.doAnimation ?? false
    }

    return doAnimation
  }

  queue.enqueue({ ...startNode, cost: 0 }, 0)

  while (!queue.isEmpty()) {
    const current = queue.dequeue()
    if (current === undefined) continue

    const currentKey = getKey(current)

    if (visited.has(currentKey)) continue
    visited.add(currentKey)

    if (pointsAreEqual(current.position, endPoint)) {
      results.push({
        path: reconstructPath(current, parentMap),
        cost: current.cost,
      })

      continue
    }

    processDirections({
      ...params,
      current,
      bounds,
      endChar,
      loggingGrid,
      handler: directionHandler,
    })
  }

  return results
}
