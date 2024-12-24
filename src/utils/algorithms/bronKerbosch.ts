export interface BronKerboschGraph<T> {
  vertices: T[]
  edges: [T, T][]
}

const getNeighbors = <T>(graph: BronKerboschGraph<T>, vertex: T): Set<T> => {
  const neighbors = graph.edges
    .filter(([v1, v2]) => {
      return v1 === vertex || v2 === vertex
    })
    .map(([v1, v2]) => {
      return v1 === vertex ? v2 : v1
    })

  return new Set(neighbors)
}

/**
 * Bron-Kerbosch algorithm for finding maximal cliques in a graph.
 * Learned from https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm
 */
export const bronKerbosch = <T>(graph: BronKerboschGraph<T>, cliques: Set<T>[], P: Set<T>, R = new Set<T>(), X = new Set<T>()) => {
  if (P.size === 0 && X.size === 0) {
    cliques.push(new Set(R)) // Output maximal clique
    return
  }

  const pivot = Array.from(new Set([...P, ...X]))[0] // Choose pivot (simplified)
  const pivotNeighbors = getNeighbors(graph, pivot)
  const filteredNeighbors = Array.from(P).filter((vertex: T) => !pivotNeighbors.has(vertex))

  for (const vertex of filteredNeighbors) {
    const neighbors = getNeighbors(graph, vertex)

    const newP = new Set([...P].filter((localVertex: T) => neighbors.has(localVertex)))
    const newR = new Set([...R, vertex])
    const newX = new Set([...X].filter((localVertex: T) => neighbors.has(localVertex)))

    bronKerbosch(graph, cliques, newP, newR, newX)

    P.delete(vertex)
    X.add(vertex)
  }
}
