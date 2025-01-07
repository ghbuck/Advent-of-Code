import { getKey, getSharedInfo, pointsAreEqual, processDirections, reconstructOptimalPaths } from '@utils/algorithms/Dijkstra/helpers.js'
import { DijkstraDirectionHandlerParams, DijkstraNodeV2, DijkstraParams, DijkstraResults } from '@utils/algorithms/Dijkstra/interfaces.js'
import { PriorityQueue } from '@utils/models/PriorityQueue.js'

export const findAllOptimalPaths = <T>(params: DijkstraParams<T>): DijkstraResults[] => {
  const optimalPaths: DijkstraNodeV2[] = []

  const best = new Map<string, number>()
  const queue = new PriorityQueue<DijkstraNodeV2>()

  const [bounds, startNode, endPoint, endChar, loggingGrid] = getSharedInfo(params.grid, params.start, params.end)

  const directionHandler = ({ currentV2, newPosition, newCost, extraCost, direction }: DijkstraDirectionHandlerParams) => {
    let doAnimation = false

    if (newCost < cheapestPathCost && newCost - (currentV2.previous?.cost ?? 0) !== extraCost) {
      queue.enqueue({ position: newPosition, cost: newCost, direction: direction, previous: currentV2 }, 0)
      doAnimation = params.doAnimation ?? false
    }

    return doAnimation
  }

  queue.enqueue({ ...startNode, cost: 0, previous: undefined }, 0)

  let cheapestPathCost = Infinity

  while (!queue.isEmpty()) {
    const current = queue.dequeue()
    if (current === undefined) continue

    const currentKey = getKey(current)
    const bestSoFar = best.get(currentKey) ?? Infinity

    if (current.cost > bestSoFar) continue

    best.set(currentKey, current.cost)

    if (pointsAreEqual(current.position, endPoint)) {
      if (current.cost > cheapestPathCost) continue
      if (current.cost < cheapestPathCost) optimalPaths.length = 0

      optimalPaths.push(current)
      cheapestPathCost = current.cost

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

  return optimalPaths.map(
    (node: DijkstraNodeV2): DijkstraResults => ({
      path: reconstructOptimalPaths(node),
      cost: node.cost,
    }),
  )
}
