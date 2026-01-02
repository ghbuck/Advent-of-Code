import { RunParams, Solution } from '@utils/dataTypes/index.js'
import { getInput } from '@utils/files/index.js'
import { Queue } from '@utils/models/Queue.js'
import { printAnswers } from '@utils/printing/index.js'

import { JoltageWorkerMsg } from './joltageWorker.js'

import os from 'node:os'
import { Worker } from 'node:worker_threads'

interface Machine {
  lights: boolean[]
  buttonMasks: number[]
  joltages: number[]
}

interface LightNode {
  state: number
  pushes: number
}

//===== Helpers =====//

/**
 * Convenience function to convert an array of booleans to an integer.
 */
const boolsToInt = (boolArray: boolean[]): number => {
  return bitsToInt(boolArray.map((bool) => (bool ? 1 : 0)))
}

/**
 * Convert an array of bits (0s and 1s) to an integer.
 * Shifts left to keep the least significant bit at index 0.
 */
const bitsToInt = (bitArray: number[]): number => {
  return bitArray.reduce((acc, bit, i) => acc | (bit << i), 0)
}

//===== Worker management =====//

const getJobMsgQueue = (machines: Machine[]): Queue<JoltageWorkerMsg> => {
  const machineQueue = new Queue<JoltageWorkerMsg>()

  for (const [index, machine] of machines.entries()) {
    machineQueue.enqueue({
      type: 'job',
      id: index,
      buttonMasks: machine.buttonMasks,
      joltages: machine.joltages,
    })
  }

  return machineQueue
}

const getWorkerQueue = (numJobs: number): Worker[] => {
  const maxWorkers = Math.min(numJobs, os.cpus().length - 1)

  const workers: Worker[] = []
  for (let i = 0; i < maxWorkers; i++) {
    const worker = new Worker(new URL('./joltageWorker.ts', import.meta.url))
    workers.push(worker)
  }

  return workers
}

const cleanUpWorkers = (workers: Worker[]) => {
  for (const worker of workers) {
    if (worker) {
      worker.postMessage({ type: 'shutdown' })
    }
  }
}

//===== Parser =====//

const parseInput = (input: string): Machine[] => {
  const machines: Machine[] = []

  const lines = input.split('\n')
  for (const line of lines) {
    // Use boolean as a bit representation
    const lights =
      line
        .match(/\[(.+?)\]/)?.[1]
        .split('')
        .map((char) => char === '#') ?? []

    // Extract joltages
    const joltages =
      line
        .match(/\{(.+?)\}/)?.[1]
        .split(',')
        .map(Number) ?? []

    // We're going to store each button as a bitmask integer
    const buttonMasks: number[] = []

    for (const match of line.matchAll(/\([\d,]+\)/g)) {
      // Get the light indicies this button toggles
      const numbers = new Set<number>(match[0].slice(1, -1).split(',').map(Number))
      // Create a bit array for the button
      const bits: number[] = []
      for (let index = 0; index < lights.length; index++) {
        bits.push(numbers.has(index) ? 1 : 0)
      }

      // Create a bitmask integer for the button
      buttonMasks.push(bitsToInt(bits))
    }

    machines.push({
      lights,
      buttonMasks,
      joltages,
    })
  }

  return machines
}

//===== BFS functions =====//

const runBFSForLights = (machine: Machine): number => {
  const start = 0
  const goal = boolsToInt(machine.lights)

  const seenStates = new Set<number>()
  const queue = new Queue<LightNode>()

  queue.enqueue({ state: start, pushes: 0 })

  while (!queue.isEmpty()) {
    const current = queue.dequeue()
    if (current === undefined) continue

    // Try pushing each button
    for (const buttonMask of machine.buttonMasks) {
      const newPush: LightNode = {
        state: current.state ^ buttonMask,
        pushes: current.pushes + 1,
      }

      if (newPush.state === goal) {
        // Found the solution
        return newPush.pushes
      }

      if (!seenStates.has(newPush.state)) {
        seenStates.add(newPush.state)
        queue.enqueue(newPush)
      }
    }
  }

  // No solution found
  return -1
}

//===== Answer functions =====//

const findMinPushesForLights = (machines: Machine[]): number => {
  const results: number[] = []

  for (const machine of machines) {
    const minPushes = runBFSForLights(machine)
    results.push(minPushes)
  }

  return results.reduce((total, result) => total + (result ?? 0), 0)
}

const findMinPushesForJoltages = async (machines: Machine[]): Promise<number> => {
  const jobQueue = getJobMsgQueue(machines)
  const numJobs = jobQueue.size()

  const workers = getWorkerQueue(numJobs)

  return new Promise<number>((resolve, reject) => {
    // Collect results
    let total = 0
    let resultsReceived = 0

    // Set up message handlers
    for (const worker of workers) {
      worker.on('message', (msg: JoltageWorkerMsg) => {
        switch (msg.type) {
          case 'ready':
            {
              const job = jobQueue.dequeue()
              if (job) {
                worker.postMessage(job)
              }
            }
            break
          case 'result':
            {
              resultsReceived++
              total += msg.minPushes
            }
            break
          case 'error': {
            resultsReceived++
            reject(new Error(msg.message))
          }
        }

        // Check if all results have been received
        if (resultsReceived === numJobs) {
          cleanUpWorkers(workers)
          resolve(total)
        }
      })
    }
  })
}

//===== Main function =====//

export const run = async (params: RunParams) => {
  const solution: Solution = {
    part1: params.isTest ? 7 : 436,
    part2: params.isTest ? 33 : 14999,
  }

  const input = parseInput(await getInput(params))

  printAnswers({
    params,
    answer1: params.part === 'all' || params.part === 1 ? findMinPushesForLights(input) : undefined,
    answer2: params.part === 'all' || params.part === 2 ? await findMinPushesForJoltages(input) : undefined,
    solution,
  })
}
