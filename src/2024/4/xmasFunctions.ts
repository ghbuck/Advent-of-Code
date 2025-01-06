type CheckResult = 0 | 1

const checkNorth = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars = input[rowIndex][charIndex] + input[rowIndex - 1][charIndex] + input[rowIndex - 2][charIndex] + input[rowIndex - 3][charIndex]

  return chars === 'XMAS' ? 1 : 0
}

const checkNorthEast = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars =
    input[rowIndex][charIndex] + input[rowIndex - 1][charIndex + 1] + input[rowIndex - 2][charIndex + 2] + input[rowIndex - 3][charIndex + 3]

  return chars === 'XMAS' ? 1 : 0
}

const checkEast = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars = input[rowIndex][charIndex] + input[rowIndex][charIndex + 1] + input[rowIndex][charIndex + 2] + input[rowIndex][charIndex + 3]

  return chars === 'XMAS' ? 1 : 0
}

const checkSouthEast = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars =
    input[rowIndex][charIndex] + input[rowIndex + 1][charIndex + 1] + input[rowIndex + 2][charIndex + 2] + input[rowIndex + 3][charIndex + 3]

  return chars === 'XMAS' ? 1 : 0
}

const checkSouth = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars = input[rowIndex][charIndex] + input[rowIndex + 1][charIndex] + input[rowIndex + 2][charIndex] + input[rowIndex + 3][charIndex]

  return chars === 'XMAS' ? 1 : 0
}

const checkSouthWest = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars =
    input[rowIndex][charIndex] + input[rowIndex + 1][charIndex - 1] + input[rowIndex + 2][charIndex - 2] + input[rowIndex + 3][charIndex - 3]

  return chars === 'XMAS' ? 1 : 0
}

const checkWest = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars = input[rowIndex][charIndex] + input[rowIndex][charIndex - 1] + input[rowIndex][charIndex - 2] + input[rowIndex][charIndex - 3]

  return chars === 'XMAS' ? 1 : 0
}

const checkNorthWest = (input: string[][], rowIndex: number, charIndex: number): CheckResult => {
  const chars =
    input[rowIndex][charIndex] + input[rowIndex - 1][charIndex - 1] + input[rowIndex - 2][charIndex - 2] + input[rowIndex - 3][charIndex - 3]

  return chars === 'XMAS' ? 1 : 0
}

export const checkForXMAS = (input: string[][]): number => {
  let numFoundWords = 0

  const maxRowIndex = input.length - 4
  const maxCharIndex = input[0].length - 4

  for (let rowIndex = 0; rowIndex < input.length; ++rowIndex) {
    const row = input[rowIndex]

    for (let charIndex = 0; charIndex < row.length; ++charIndex) {
      const char = row[charIndex]

      if (char === 'X') {
        numFoundWords +=
          (rowIndex >= 3 ? checkNorth(input, rowIndex, charIndex) : 0) +
          (rowIndex >= 3 && charIndex <= maxCharIndex ? checkNorthEast(input, rowIndex, charIndex) : 0) +
          (charIndex <= maxCharIndex ? checkEast(input, rowIndex, charIndex) : 0) +
          (rowIndex <= maxRowIndex && charIndex <= maxCharIndex ? checkSouthEast(input, rowIndex, charIndex) : 0) +
          (rowIndex <= maxRowIndex ? checkSouth(input, rowIndex, charIndex) : 0) +
          (rowIndex <= maxRowIndex && charIndex >= 3 ? checkSouthWest(input, rowIndex, charIndex) : 0) +
          (charIndex >= 3 ? checkWest(input, rowIndex, charIndex) : 0) +
          (rowIndex >= 3 && charIndex >= 3 ? checkNorthWest(input, rowIndex, charIndex) : 0)
      }
    }
  }

  return numFoundWords
}
