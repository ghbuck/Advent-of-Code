const checkWestToEast = (input: string[][], rowIndex: number, charIndex: number): boolean => {
  const chars = `${input[rowIndex - 1]?.[charIndex - 1]}A${input[rowIndex + 1]?.[charIndex + 1]}`
  return chars === 'MAS' || chars === 'SAM'
}

const checkEastToWest = (input: string[][], rowIndex: number, charIndex: number): boolean => {
  const chars = `${input[rowIndex - 1]?.[charIndex + 1]}A${input[rowIndex + 1]?.[charIndex - 1]}`
  return chars === 'MAS' || chars === 'SAM'
}

export const checkForX_MAS = (input: string[][]): number => {
  let numFoundWords = 0

  for (let rowIndex = 0; rowIndex < input.length; ++rowIndex) {
    const row = input[rowIndex]

    for (let charIndex = 0; charIndex < row.length; ++charIndex) {
      const char = row[charIndex]

      if (char === 'A') {
        numFoundWords += checkWestToEast(input, rowIndex, charIndex) && checkEastToWest(input, rowIndex, charIndex) ? 1 : 0
      }
    }
  }

  return numFoundWords
}
