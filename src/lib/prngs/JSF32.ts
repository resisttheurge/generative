import { Hasher } from '@hashers/Hasher'
import { Vector } from '@math/vectors'

import { PRNG } from './PRNG'

export type JSF32Algorithm = 'jsf32a' | 'jsf32b' | 'jsf32c'

export const jsf32Algorithms: JSF32Algorithm[] = ['jsf32a', 'jsf32b']

export type JSF32State = Vector<4>

/**
 * Adapted from Bob Jenkins' Small PRNG via Bryc.
 * @see https://burtleburtle.net/bob/rand/smallprng.html
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#jsf--smallprng
 */
export abstract class JSF32 implements PRNG<JSF32State> {
  readonly name: string = 'jsf32'
  readonly min = 0x0
  readonly max = 0x100000000

  constructor(readonly hasher: Hasher<number>) {}

  // Author-recommended seeding procedure.
  initState(seed: string): JSF32State {
    const seedx = this.hasher.initState(seed)
    let state: JSF32State = [0xf1ea5eed, seedx, seedx, seedx]
    for (let i = 0; i < 20; i++) {
      state = this.nextState(state)
    }
    return state
  }

  abstract nextState(state: JSF32State): JSF32State

  extractValue(state: JSF32State): number {
    return state[3] >>> 0
  }
}

/**
 * This is the original version of JSF32.
 */
export class JSF32a extends JSF32 {
  readonly name = 'jsf32a'
  nextState(state: JSF32State): JSF32State {
    let [a, b, c, d] = state
    const t = (a - ((b << 27) | (b >>> 5))) | 0
    a = b ^ ((c << 17) | (c >>> 15))
    b = (c + d) | 0
    c = (d + t) | 0
    d = (a + t) | 0
    return [a, b, c, d]
  }
}

/**
 * This is an alternate version of JSF32 with an extra
 * rotate operation to improve avalanche behavior.
 */
export class JSF32b extends JSF32 {
  readonly name = 'jsf32b'
  nextState(state: JSF32State): JSF32State {
    let [a, b, c, d] = state
    const t = (a - ((b << 23) | (b >>> 9))) | 0
    a = (b ^ ((c << 16) | (c >>> 16))) | 0
    b = (c + ((d << 11) | (d >>> 21))) | 0
    b = (c + d) | 0
    c = (d + t) | 0
    d = (a + t) | 0
    return [a, b, c, d]
  }
}
