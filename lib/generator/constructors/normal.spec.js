/* eslint-env jest */

import fc from 'fast-check'

import { normal } from './normal'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbNormalConfig =
  () =>
    fc.record({
      mu: fc.float({ noDefaultInfinity: true, noNaN: true }),
      sigma: fc.float({ noDefaultInfinity: true, noNaN: true }),
      count: fc.integer({ min: 1, max: 1e3 })
    })

export const arbNormal =
  () =>
    arbNormalConfig()
      .map(normal)

describe('The normal Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbNormal)
  it('should return a Generator that returns an array of config.count normally-distributed independent values around config.mu with a given config.sigma', () => {
    fc.assert(
      fc.property(
        arbNormalConfig(),
        arbSeed(),
        (config, seed) => {
          const [value, nextSeed] = normal(config)(seed)
          expect(value).toBeArrayOfSize(config.count)
          value.forEach(n => expect(n).toBeFinite())
          expect(nextSeed).not.toStrictEqual(seed)
        }
      )
    )
  })
})
