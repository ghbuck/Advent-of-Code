/* eslint-disable */
// @ts-nocheck

/**
 * These examples were taken from 2025 Day 10 solution (with some edits) which uses worker threads to parallelize work.
 * Use them as a template for implementing worker threads in other solutions.
 */

//===== Worker management =====//

const getJobQueue = (machines: Machine[]): Queue<JoltageWorkerMsg> => {
  const jobQueue = new Queue<JoltageWorkerMsg>()

  for (const [index, machine] of machines.entries()) {
    jobQueue.enqueue({
      type: 'job',
      id: index,
      buttonMasks: machine.buttonMasks,
      joltages: machine.joltages,
    })
  }

  return jobQueue
}

const getWorkers = (numJobs: number): Worker[] => {
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

//===== Main function =====//

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
