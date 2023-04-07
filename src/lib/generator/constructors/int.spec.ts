/* eslint-env jest */

import fc from 'fast-check'

import { int } from './int'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbInt =
  () =>
    fc.integer({ noDefaultInfinity: true, noNaN: true })
      .chain(
        min =>
          fc.integer({ min, noDefaultInfinity: true, noNaN: true })
            .map(
              max =>
                int({ min, max })
            )
      )

describe('The int Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbInt)
  it('should return a Generator that returns an integer value between the given min and max values', () => {
    fc.assert(
      fc.property(
        fc.integer({ noDefaultInfinity: true, noNaN: true })
          .chain(
            min =>
              fc.integer({ min, noDefaultInfinity: true, noNaN: true })
                .map(max => [min, max])
          ),
        arbSeed(),
        ([min, max], seed) => {
          const [value, nextSeed] = int({ min, max })(seed)
          expect(value).toBeInteger()
          expect(value).toBeGreaterThanOrEqual(min)
          expect(value).toBeLessThanOrEqual(max)
          expect(nextSeed).not.toBe(seed)
        }
      )
    )
  })
})
