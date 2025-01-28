import { PRNG } from './PRNG'
import { Hasher } from '../hashers'

export type Splitmix32Algorithm = 'splitmix32a' | 'splitmix32b'

export const splitmix32Algorithms: Splitmix32Algorithm[] = [
  'splitmix32a',
  'splitmix32b',
]

export type Splitmix32State = number

export abstract class Splitmix32 implements PRNG<Splitmix32State> {
  readonly name: string = 'splitmix32'
  readonly min = 0x0
  readonly max = 0x100000000

  constructor(readonly hasher: Hasher<number>) {}

  initState(seed: string): Splitmix32State {
    return this.hasher.initState(seed)
  }

  nextState(state: Splitmix32State): Splitmix32State {
    return (state + 0x9e3779b9) | 0
  }

  abstract extractValue(state: Splitmix32State): number

  hashState(state: Splitmix32State): Splitmix32State {
    return this.hasher.nextState(state)
  }
}

export class Splitmix32a extends Splitmix32 {
  readonly name = 'splitmix32a'
  extractValue(state: Splitmix32State): number {
    state ^= state >>> 15
    state = Math.imul(state, 0x85ebca6b)
    state ^= state >>> 13
    state = Math.imul(state, 0xc2b2ae35)
    state ^= state >>> 16
    return state >>> 0
  }
}

export class Splitmix32b extends Splitmix32 {
  readonly name = 'splitmix32b'
  extractValue(state: Splitmix32State): number {
    state ^= state >>> 16
    state = Math.imul(state, 0x21f0aaad)
    state ^= state >>> 15
    state = Math.imul(state, 0x735a2d97)
    state ^= state >>> 15
    return state >>> 0
  }
}
