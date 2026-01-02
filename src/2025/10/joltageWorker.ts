import GLPK, { type LP } from 'glpk.js/node'
import { parentPort } from 'node:worker_threads'

interface BaseMsg {
  type: 'ready' | 'shutdown'
}

interface JobMsg {
  type: 'job'
  id: number
  buttonMasks: number[]
  joltages: number[]
}

interface ResultMsg {
  type: 'result'
  id: number
  minPushes: number
}

interface ErrorMsg {
  type: 'error'
  id: number
  message: string
}

export type JoltageWorkerMsg = BaseMsg | JobMsg | ResultMsg | ErrorMsg

interface LPVar {
  name: string
  coef: number
}

interface Bound {
  name: string
  type: number
  lb: number
  ub: number
}

//===== Consts =====//

const parent = parentPort
if (!parent) {
  throw new Error('This module must be run as a worker thread.')
}

// Initialize GLPK
const glpk = await GLPK()

//===== Solver =====//

/**
 * Generates the subject to variables for a given light index.
 * Sparse representation: only includes buttons that affect the given light.
 */
function getSubjectToVars(buttonMasks: number[], lightIndex: number): LPVar[] {
  const vars: LPVar[] = []

  for (const [buttonIndex, buttonMask] of buttonMasks.entries()) {
    const coef = (buttonMask >> lightIndex) & 1
    if (coef !== 0) {
      vars.push({
        name: `x${buttonIndex}`,
        coef,
      })
    }
  }

  return vars
}

/**
 * Computes an upper bound for the number of pushes for a given button mask and joltages.
 * This is used to limit the search space for the ILP solver.
 */
function computeUpperBound(buttonMask: number, joltages: number[]): number {
  let ub = Infinity

  for (let i = 0; i < joltages.length; i++) {
    if (((buttonMask >> i) & 1) === 1) {
      ub = Math.min(ub, joltages[i])
    }
  }

  return ub === Infinity ? 0 : ub
}

/**
 * Generates the LP problem for a given machine.
 */
function getLP(id: number, buttonMasks: number[], joltages: number[]): LP {
  const objectiveVars: LPVar[] = []
  const bounds: Bound[] = []
  const generals: string[] = []

  // Define objective variables and bounds for each button
  for (const [index, buttonMask] of buttonMasks.entries()) {
    objectiveVars.push({
      name: `x${index}`,
      coef: 1,
    })

    bounds.push({
      name: `x${index}`,
      type: glpk.GLP_LO,
      lb: 0,
      ub: computeUpperBound(buttonMask, joltages),
    })

    generals.push(`x${index}`)
  }

  return {
    name: `Machine ${id}`,
    objective: {
      direction: glpk.GLP_MIN,
      name: 'minPushes',
      vars: objectiveVars,
    },
    subjectTo: joltages.map((joltage, lightIndex) => ({
      name: `light_${lightIndex}`,
      vars: getSubjectToVars(buttonMasks, lightIndex),
      bnds: {
        type: glpk.GLP_FX,
        ub: joltage,
        lb: joltage,
      },
    })),
    bounds,
    generals,
  }
}

/**
 * Solves the joltage machine problem using ILP.
 */
function solveMachine(id: number, buttonMasks: number[], joltages: number[]): number {
  const lp = getLP(id, buttonMasks, joltages)
  const res = glpk.solve(lp)

  // Return the minimum number of pushes if optimal, else return 0
  return res.result.status === glpk.GLP_OPT ? res.result.z : 0
}

//===== Event Handlers =====//

parent.on('message', (msg: JoltageWorkerMsg) => {
  if (msg.type === 'shutdown') {
    process.exit(0)
  }

  if (msg.type === 'job') {
    const { id, buttonMasks, joltages } = msg

    try {
      const minPushes = solveMachine(id, buttonMasks, joltages)
      parent.postMessage({ type: 'result', id, minPushes })
    } catch (error) {
      parent.postMessage({ type: 'error', id, message: String((error as Error)?.message ?? error) })
    } finally {
      parent.postMessage({ type: 'ready' })
    }
  }
})

// announce ready once at startup
parent.postMessage({ type: 'ready' })
