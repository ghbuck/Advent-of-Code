/** Heap's Algorithm */
export const makePermutations = <T>(arr: T[], k?: number): T[][] => {
  const result: T[][] = []

  function generate(n: number, array: T[]): void {
    if (n === 1) {
      if (k === undefined || array.length >= k) {
        result.push(array.slice(0, k)) // Only take the first `k` elements
      }
      return
    }

    for (let i = 0; i < n; i++) {
      generate(n - 1, array)

      if (n % 2 === 0) {
        // If n is even, swap the ith and (n-1)th elements
        ;[array[i], array[n - 1]] = [array[n - 1], array[i]]
      } else {
        // If n is odd, swap the 0th and (n-1)th elements
        ;[array[0], array[n - 1]] = [array[n - 1], array[0]]
      }
    }
  }

  generate(arr.length, arr)
  return result
}

export const makeCombinations = <T>(arr: T[], k: number): T[][] => {
  const result: T[][] = []

  function backtrack(start: number, current: T[]): void {
    if (current.length === k) {
      result.push([...current]) // Add the current combination
      return
    }

    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]) // Include this element
      backtrack(i + 1, current) // Recurse with the next elements
      current.pop() // Exclude the element and backtrack
    }
  }

  backtrack(0, [])
  return result
}
