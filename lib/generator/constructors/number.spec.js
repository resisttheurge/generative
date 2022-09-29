/* eslint-env jest */

import fc from 'fast-check'

import { number } from './number'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbNumber =
  () =>
    fc.double({ noDefaultInfinity: true, noNaN: true })
      .chain(
        min =>
          fc.double({ min, noDefaultInfinity: true, noNaN: true })
            .map(
              max =>
                number({ min, max })
            )
      )

describe('The number Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbNumber)
  it('should return a Generator that returns a floating point value between the given min and max values', () => {
    fc.assert(
      fc.property(
        fc.float({ noDefaultInfinity: true, noNaN: true })
          .chain(
            min =>
              fc.float({ min, noDefaultInfinity: true, noNaN: true })
                .map(max => [min, max])
          ),
        arbSeed(),
        ([min, max], seed) => {
          const [value, nextSeed] = number({ min, max })(seed)
          expect(value).toBeFinite()
          expect(value).toBeGreaterThanOrEqual(min)
          expect(value).toBeLessThanOrEqual(max)
          expect(nextSeed).not.toBe(seed)
        }
      )
    )
  })
})
