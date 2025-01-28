import { PRNG } from './PRNG'
import { Hasher } from 'lib/hashers'

export type Mulberry32State = number

/**
 * Adapted from Bryc's JavaScript implementation of the original C program
 * @see https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 * @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */
export class Mulberry32 implements PRNG<Mulberry32State> {
  readonly name = 'mulberry32'
  readonly min = 0x0
  readonly max = 0x100000000

  constructor(readonly hasher: Hasher<number>) {}

  initState(seed: string): Mulberry32State {
    return this.hasher.initState(seed)
  }

  nextState(state: Mulberry32State): Mulberry32State {
    return (state + 0x6d2b79f5) | 0
  }

  hashState(state: Mulberry32State): Mulberry32State {
    return this.hasher.nextState(state)
  }

  extractValue(state: Mulberry32State): number {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    state = (state + Math.imul(state ^ (state >>> 7), 61 | state)) ^ state
    return (state ^ (state >>> 14)) >>> 0
  }
}
