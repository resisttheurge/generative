/* eslint-env jest */

import fc from 'fast-check'

import { Generator } from '../Generator'
import { shouldBeAGenerator } from './index.spec'
import { uniform } from './uniform'

describe('The uniform Generator', () => {
  shouldBeAGenerator(uniform)
  it('should return [u, seed + 0x6D2B79F5 | 0] for a given seed, where u is a number in the open interval [0, 1)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        seed => {
          const [u, nextSeed] = uniform(seed)
          expect(nextSeed).toBe(seed + 0x6D2B79F5 | 0)
          expect(u).toSatisfy(u => u >= 0 && u < 1)
        }
      )
    )
  })
  it('should return the same [value, seed] pair when given the same initial seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        seed => {
          const result1 = uniform(seed)
          const result2 = uniform(seed)
          expect(result2).toStrictEqual(result1)
        }
      )
    )
  })
  it('should return different [value, seed] pairs when given different initial seeds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (seed1, seed2) => {
          fc.pre(seed1 !== seed2)
          const result1 = uniform(seed1)
          const result2 = uniform(seed2)
          expect(result2).not.toStrictEqual(result1)
        }
      )
    )
  })
})
