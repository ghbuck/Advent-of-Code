import { parentPort } from 'node:worker_threads'

interface BaseMsg {
  type: 'ready' | 'shutdown'
}

interface JobMsg {
  type: 'job'
  id: number
  // other parameters
}

interface ResultMsg {
  type: 'result'
  id: number
  result: unknown
}

interface ErrorMsg {
  type: 'error'
  id: number
  message: string
}

export type WorkerMsg = BaseMsg | JobMsg | ResultMsg | ErrorMsg

//===== Consts =====//

const parent = parentPort
if (!parent) {
  throw new Error('This module must be run as a worker thread.')
}

//===== Main functions =====//

const runJob = (/* parameters */): unknown => {
  // implement job logic here
  return {}
}

//===== Event Handlers =====//

parent.on('message', (msg: WorkerMsg) => {
  if (msg.type === 'shutdown') {
    process.exit(0)
  }

  if (msg.type === 'job') {
    const { id } = msg

    try {
      const result = runJob()
      parent.postMessage({ type: 'result', id, result })
    } catch (error) {
      parent.postMessage({ type: 'error', id, message: String((error as Error)?.message ?? error) })
    } finally {
      parent.postMessage({ type: 'ready' })
    }
  }
})

// announce ready once at startup
parent.postMessage({ type: 'ready' })
