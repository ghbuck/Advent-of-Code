import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

interface NodeInfo {
  name: string
  directNodesAhead: Set<string>
}

type NodeMap = Map<string, NodeInfo>
type NodeMemo = Map<string, Map<string, number>>

interface TraverseNodeParams {
  currentNode: string
  endNode: string
  nodeMap: NodeMap
  requiredNodes: string[]
  memo: NodeMemo
  visited: Set<string>
  passedRequired: Set<string>
}

const parseInput = (input: string): NodeMap => {
  const nodeMap = new Map<string, NodeInfo>()

  const lines = input.split('\n')
  for (const line of lines) {
    const [from, edges] = line.split(':').map((part) => part.trim())
    const fromNode = nodeMap.get(from) ?? {
      name: from,
      directNodesAhead: new Set(),
    }

    for (const edge of edges.split(' ')) {
      const edgeNode = nodeMap.get(edge) ?? {
        name: edge,
        directNodesAhead: new Set(),
      }

      fromNode.directNodesAhead.add(edge)
      nodeMap.set(edge, edgeNode)
    }

    nodeMap.set(from, fromNode)
  }

  return nodeMap
}

const traverseNodes = ({ currentNode, endNode, nodeMap, requiredNodes, memo, visited, passedRequired }: TraverseNodeParams): number => {
  if (currentNode === endNode) {
    // Only count if we've passed through all required nodes
    return requiredNodes.every((req) => passedRequired.has(req)) ? 1 : 0
  }

  // Avoid cycles
  if (visited.has(currentNode)) return 0

  // Create memo key based on current node and which required nodes we've passed
  const requiredKey = Array.from(passedRequired).sort().join(',')
  const nodeMemo = memo.get(currentNode) ?? new Map<string, number>()

  if (!memo.has(currentNode)) {
    memo.set(currentNode, nodeMemo)
  }

  if (nodeMemo.has(requiredKey)) {
    const cachedValue = nodeMemo.get(requiredKey)
    if (cachedValue !== undefined) {
      return cachedValue
    }
  }

  // Mark current node as visited
  visited.add(currentNode)

  // Get current node info
  const node = nodeMap.get(currentNode)

  // Start counting paths from current node
  let totalPaths = 0

  // Check if current node is one of the required nodes
  const newPassedRequired = new Set(passedRequired)
  if (requiredNodes.includes(currentNode)) {
    newPassedRequired.add(currentNode)
  }

  if (node) {
    for (const nextNode of node.directNodesAhead) {
      totalPaths += traverseNodes({
        currentNode: nextNode,
        endNode,
        nodeMap,
        requiredNodes,
        memo,
        visited: new Set(visited),
        passedRequired: newPassedRequired,
      })
    }
  }

  // Memoize the computed value
  nodeMemo.set(requiredKey, totalPaths)

  return totalPaths
}

const countAllPaths = (nodeMap: NodeMap, startNode: string, endNode: string, requiredNodes: string[] = []): number => {
  const memo: NodeMemo = new Map<string, Map<string, number>>()

  return traverseNodes({
    currentNode: startNode,
    endNode,
    nodeMap,
    requiredNodes,
    memo,
    visited: new Set(),
    passedRequired: new Set(),
  })
}

const getPart1Answer = (nodeMap: NodeMap): number => {
  return countAllPaths(nodeMap, 'you', 'out')
}

const getPart2Answer = (nodeMap: NodeMap): number => {
  return countAllPaths(nodeMap, 'svr', 'out', ['dac', 'fft'])
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 5 : 674,
    part2: params.isTest ? 2 : 438314708837664,
  }

  const nodeMap = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? getPart1Answer(nodeMap) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? getPart2Answer(nodeMap) : undefined,
    solution,
  })
}
