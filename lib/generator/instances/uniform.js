import { Generator } from '../Generator'

/**
 *  * PRNG generator function. It takes a given seed integer and returns a generator
 * that can be used as a PRNG.
 *
 * mulberry32 prng from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 *
 * @param {*} seed
 */
export const uniform = Generator(
  seed => {
    const nextSeed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(nextSeed ^ nextSeed >>> 15, 1 | nextSeed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    const nextValue = ((t ^ t >>> 14) >>> 0) / 4294967296
    return [nextValue, nextSeed]
  }
)
