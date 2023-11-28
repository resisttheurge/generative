import { Hasher, initStates } from 'lib/hashers'
import { Vector } from '@math/vectors'

import { PRNG } from './PRNG'

export type SFC32Algorithm = 'sfc32a' | 'sfc32b' | 'sfc32c'

export const sfc32Algorithms: SFC32Algorithm[] = [
  'sfc32a',
  'sfc32b',
  'sfc32c'
]

export type SFC32State = Vector<4>

/**
 * Small Fast Counter PRNG adapted from PracRand via Bryc.
 * Subclasses implement different seeding procedures.
 *
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#sfc32
 * @see http://pracrand.sourceforge.net/
 * @see {@link SFC32a} for the "slow" 64-bit seeding procedure
 * @see {@link SFC32b} for the "fast" 64-bit seeding procedure
 * @see {@link SFC32c} for the 96-bit seeding procedure
 */
export abstract class SFC32 implements PRNG<SFC32State> {
  readonly name: string = 'sfc32'
  readonly min = 0x0
  readonly max = 0x100000000

  constructor (readonly hasher: Hasher<number>) {}

  abstract initState (seed: string): SFC32State

  nextState (state: SFC32State): SFC32State {
    let [a, b, c, d] = state
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    const t = (a + b | 0) + d | 0
    d = d + 1 | 0
    a = b ^ b >>> 9
    b = c + (c << 3) | 0
    c = c << 21 | c >>> 11
    c = c + t | 0
    return [a, b, c, d]
  }

  extractValue (state: SFC32State): number {
    const [a, b, , d] = state
    return (a + b | 0) + d >>> 0
  }
}

export class SFC32a extends SFC32 {
  readonly name = 'sfc32a'

  // "slow" 64-bit seeding procedure
  initState (seed: string): SFC32State {
    const [b, c] = initStates(this.hasher, seed, 2)
    let currentState: SFC32State = [0, b | 0, c | 0, 1]
    for (let i = 0; i < 12; i++) {
      currentState = this.nextState(currentState)
    }
    return currentState
  }
}

export class SFC32b extends SFC32 {
  readonly name = 'sfc32b'

  // "fast" 64-bit seeding procedure
  initState (seed: string): SFC32State {
    const [b, c] = initStates(this.hasher, seed, 2)
    let currentState: SFC32State = [0, b | 0, c | 0, 1]
    for (let i = 0; i < 8; i++) {
      currentState = this.nextState(currentState)
    }
    return currentState
  }
}

export class SFC32c extends SFC32 {
  readonly name = 'sfc32c'

  // 96-bit seeding procedure
  initState (seed: string): SFC32State {
    const [a, b, c] = initStates(this.hasher, seed, 3)
    let currentState: SFC32State = [a | 0, b | 0, c | 0, 1]
    for (let i = 0; i < 8; i++) {
      currentState = this.nextState(currentState)
    }
    return currentState
  }
}
