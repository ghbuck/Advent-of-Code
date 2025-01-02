import { Device } from './Device.js'

export interface ActionParams {
  operand: number
  vm: Device
}

export type Action = (params: ActionParams) => void

export class Instructions {
  #actions: Action[]

  constructor() {
    this.#actions = [
      // adv
      ({ operand, vm }: ActionParams) => vm.setRegister('A', vm.getRegister('A') >> vm.getCombo(operand)),
      // bxl
      ({ operand, vm }: ActionParams) => vm.setRegister('B', vm.getRegister('B') ^ BigInt(operand)),
      // bst
      ({ operand, vm }: ActionParams) => vm.setRegister('B', vm.getCombo(operand) & 7n),
      // jnz
      ({ operand, vm }: ActionParams) => (vm.getRegister('A') !== 0n ? vm.setPointer(operand) : undefined),
      // bxc
      ({ vm }: ActionParams) => vm.setRegister('B', vm.getRegister('B') ^ vm.getRegister('C')),
      // out
      ({ operand, vm }: ActionParams) => vm.addOutput(vm.getCombo(operand) & 7n),
      // bdv
      ({ operand, vm }: ActionParams) => vm.setRegister('B', vm.getRegister('A') >> vm.getCombo(operand)),
      // cdv
      ({ operand, vm }: ActionParams) => vm.setRegister('C', vm.getRegister('A') >> vm.getCombo(operand)),
    ]
  }

  getAction(opcode: number): Action {
    return this.#actions[opcode]
  }
}
