/* eslint-env jest */

import fc from 'fast-check'

import { normal } from './normal'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbNormalConfig =
  () =>
    fc.record({
      mu: fc.float({ noDefaultInfinity: true, noNaN: true }),
      sigma: fc.float({ noDefaultInfinity: true, noNaN: true })
    })

export const arbNormal =
  () =>
    arbNormalConfig()
      .map(normal)

describe('The normal Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbNormal)
  it('should return a Generator that returns a random value chosen from the given array of options', () => {
    fc.assert(
      fc.property(
        arbNormalConfig(),
        arbSeed(),
        (config, seed) => {
          const [value, nextSeed] = normal(config)(seed)
          expect(value).toBeArrayOfSize(2)
          value.forEach(n => expect(n).toBeFinite())
          expect(nextSeed).not.toStrictEqual(seed)
        }
      )
    )
  })
})
