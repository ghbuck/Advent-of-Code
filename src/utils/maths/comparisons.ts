export const isBetween = (mainValue: number, val1: number, val2: number, inclusive = false): boolean => {
  const min = Math.min(val1, val2)
  const max = Math.max(val1, val2)

  if (inclusive) {
    return mainValue >= min && mainValue <= max
  } else {
    return mainValue > min && mainValue < max
  }
}

export const getIntersection = <T>(set1: Set<T>, set2: Set<T>): Set<T> => {
  const intersection = new Set<T>()

  for (const item of set2) {
    if (set1.has(item)) {
      intersection.add(item)
    }
  }

  return intersection
}
