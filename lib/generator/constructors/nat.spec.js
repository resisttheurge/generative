/* eslint-env jest */

import fc from 'fast-check'

import { nat } from './nat'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbNat =
  () =>
    fc.integer({ min: 0, noDefaultInfinity: true, noNaN: true })
      .map(nat)

describe('The nat Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbNat)
  it('should return a Generator that returns an integer value between the given min and max values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, noDefaultInfinity: true, noNaN: true }),
        arbSeed(),
        (max, seed) => {
          const [value, nextSeed] = nat(max)(seed)
          expect(value).toBeInteger()
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(max)
          expect(nextSeed).not.toBe(seed)
        }
      )
    )
  })
})
