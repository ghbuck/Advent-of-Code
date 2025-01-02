import { Instructions } from './Instructions.js'

export class Device {
  #pointer: number
  #instructions: Instructions
  #registers: Map<string, bigint>
  #combos: (() => bigint)[]
  #outputs: bigint[]

  constructor(initialRegisterInfo: Map<string, bigint>) {
    this.#pointer = 0
    this.#instructions = new Instructions()
    this.#outputs = []

    this.#registers = new Map<string, bigint>()
    for (const [key, value] of initialRegisterInfo.entries()) {
      this.#registers.set(key, value)
    }

    this.#combos = [
      (): bigint => 0n,
      (): bigint => 1n,
      (): bigint => 2n,
      (): bigint => 3n,
      (): bigint => this.getRegister('A'),
      (): bigint => this.getRegister('B'),
      (): bigint => this.getRegister('C'),
      (): bigint => {
        throw new Error('Invalid combo operand')
      },
    ]
  }

  reset() {
    this.#pointer = 0
    this.#outputs = []

    for (const key of this.#registers.keys()) {
      this.#registers.set(key, 0n)
    }
  }

  getRegister(key: string): bigint {
    return this.#registers.get(key) ?? 0n
  }

  setRegister(key: string, value: bigint) {
    if (!this.#registers.has(key)) throw new Error(`Unknown register: ${key}`)

    this.#registers.set(key, value)
  }

  setPointer(value: number) {
    if (isNaN(value)) throw new Error(`Invalid value: ${value}`)

    this.#pointer = value
  }

  getCombo(operand: number): bigint {
    return this.#combos[operand]()
  }

  addOutput(value: bigint) {
    this.#outputs.push(value)
  }

  run(program: number[]): string {
    do {
      const pointer = this.#pointer
      const opcode = program[this.#pointer]
      const operand = program[this.#pointer + 1]

      const action = this.#instructions.getAction(opcode)
      action({ operand, vm: this })

      if (pointer === this.#pointer) {
        this.#pointer += 2
      }
    } while (this.#pointer < program.length)

    return this.#outputs.map(String).join(',')
  }
}
