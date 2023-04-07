/* eslint-env jest */

import fc from 'fast-check'

import { chooseFrom } from './chooseFrom'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbChooseFrom =
  () =>
    fc.array(fc.anything())
      .map(chooseFrom)

describe('The chooseFrom Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbChooseFrom)
  it('should return a Generator that returns a random value chosen from the given array of options', () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        arbSeed(),
        (options, seed) => {
          const [value, nextSeed] = chooseFrom(options)(seed)
          if (options.length === 0) {
            expect(value).toBeUndefined()
          } else {
            expect(value).toBeOneOf(options)
          }
          expect(nextSeed).not.toBe(seed)
        }
      )
    )
  })
})
