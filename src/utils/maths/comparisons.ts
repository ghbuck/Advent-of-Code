export const isBetween = (
  mainValue: number,
  val1: number,
  val2: number,
  inclusive = false,
): boolean => {
  const min = Math.min(val1, val2)
  const max = Math.max(val1, val2)

  if (inclusive) {
    return mainValue >= min && mainValue <= max
  } else {
    return mainValue > min && mainValue < max
  }
}
