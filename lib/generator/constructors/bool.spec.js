/* eslint-env jest */

import fc from 'fast-check'

import { Generator } from '../Generator'
import { bool } from './bool'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbBool = (thresholdRange = 1) => fc.float({ min: 0, max: thresholdRange }).map(bool)

describe('The bool Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbBool)
  it('should return a generator of boolean values', () => {
    fc.assert(
      fc.property(
        arbBool(),
        arbSeed(),
        (bool, seed) => {
          expect(bool).toBeInstanceOf(Generator)
          const [b, nextSeed] = bool(seed)
          expect(nextSeed).not.toBe(seed)
          expect(b).toBeBoolean()
        }
      )
    )
  })
})
