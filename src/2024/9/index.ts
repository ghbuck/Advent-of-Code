import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { printAnswers } from '@utils/printing/index.js'

enum ItemType {
  data,
  space,
}

interface MapInfo {
  id: number
  type: ItemType
  size: number
  originalSize?: number
}

interface DiskLayout {
  data: MapInfo[]
  spaces: MapInfo[]
}

const diskMapToLayout = (diskMap: number[]): DiskLayout => {
  const processingMap = new Map<number, MapInfo>()

  let idCounter = 0
  for (const [index, mapItem] of diskMap.entries()) {
    const itemType: ItemType = index % 2

    processingMap.set(index, {
      id: itemType === ItemType.data ? idCounter++ : -1,
      type: itemType,
      size: mapItem,
    })
  }

  const dataInfo: MapInfo[] = []
  const spaceInfo: MapInfo[] = []

  processingMap.forEach((info: MapInfo) => (info.type === ItemType.data ? dataInfo.push(info) : spaceInfo.push(info)))

  return {
    data: dataInfo,
    spaces: spaceInfo,
  }
}

const reorderBlocks = (diskMap: number[]): number[] => {
  const layout = diskMapToLayout(diskMap)

  let reorderedBlocks: number[] = []

  for (let index = 0; index < layout.data.length; ++index) {
    const data = layout.data[index]
    const spaces = layout.spaces[index]

    let blocks: number[] = []

    if (data.size === 0) {
      break
    }

    if (data !== undefined) {
      blocks = Array<number>(data.size).fill(data.id)
    }

    let numSpaces = spaces?.size ?? 0
    while (numSpaces > 0) {
      const replacementIndex = layout.data.findLastIndex((item: MapInfo) => item.size > 0)

      let replacement: MapInfo | undefined
      if (replacementIndex > index) {
        replacement = layout.data[replacementIndex]
      }

      if (replacement === undefined) {
        break
      }

      const numReplacements = numSpaces > replacement.size ? replacement.size : numSpaces

      blocks = [...blocks, ...Array<number>(numReplacements).fill(replacement.id)]

      numSpaces -= numReplacements
      replacement.size -= numReplacements
    }

    reorderedBlocks = [...reorderedBlocks, ...blocks]
  }

  return reorderedBlocks
}

const reorderFiles = (diskMap: number[]): number[] => {
  const layout = diskMapToLayout(diskMap)

  let reorderedFiles: number[] = []

  for (let index = 0; index < layout.data.length; ++index) {
    const data = layout.data[index]
    const spaces = layout.spaces[index]

    let files: number[] = []
    let numSpaces = spaces?.size ?? 0

    if (data !== undefined) {
      if (data.size > 0) {
        files = Array<number>(data.size).fill(data.id)
      } else {
        files = Array<number>(data.originalSize ?? 0).fill(-1)
      }
    }

    while (numSpaces > 0) {
      const replacementIndex = layout.data.findLastIndex((item: MapInfo) => item.size > 0 && item.size <= numSpaces)

      let replacement: MapInfo | undefined
      if (replacementIndex > index) {
        replacement = layout.data[replacementIndex]
      }

      if (replacement === undefined) {
        break
      }

      files = [...files, ...Array<number>(replacement.size).fill(replacement.id)]

      numSpaces -= replacement.size
      replacement.originalSize = replacement.size
      replacement.size = 0
    }

    if (numSpaces > 0) {
      files = [...files, ...Array<number>(numSpaces).fill(-1)]
    }

    reorderedFiles = [...reorderedFiles, ...files]
  }

  return reorderedFiles
}

const calculateChecksum = (diskData: number[]): number => {
  return diskData.map((block: number, index: number) => index * (block < 0 ? 0 : block)).reduce((total: number, current: number) => (total += current), 0)
}

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 1928 : 6310675819476,
    part2: params.isTest ? 2858 : 6335972980679,
  }

  const inputString = await getInput(params)
  const inputArray = inputString.split('').map(Number)

  const reorderedBlocks = reorderBlocks(inputArray)
  const reorderedFiles = reorderFiles(inputArray)

  printAnswers({
    params,
    answer1: calculateChecksum(reorderedBlocks),
    answer2: calculateChecksum(reorderedFiles),
    solution,
  })
}
