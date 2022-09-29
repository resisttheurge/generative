/* eslint-env jest */

import fc from 'fast-check'

import { simplexNoise, simplexNoise1d, simplexNoise2d, simplexNoise3d, simplexNoise4d } from './simplexNoise'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'
import { map } from '../combinators'

export const arbSimplexNoiseParams =
    (dimensions) =>
      fc.tuple(...(new Array(dimensions)).fill(fc.float).map(f => f({ noDefaultInfinity: true, noNaN: true })))

export const arbSimplexNoiseConfig =
  () =>
    fc.tuple(
      fc.constantFrom(1, 2, 3, 4)
        .chain(
          dimensions =>
            dimensions !== 1
              ? fc.record({
                  dimensions: fc.constant(dimensions),
                  params: arbSimplexNoiseParams(dimensions)
                })
              : fc.record({
                dimensions: fc.constant(dimensions),
                params: arbSimplexNoiseParams(dimensions),
                y: fc.float({ noDefaultInfinity: true, noNaN: true })
              })
        ),
      fc.float({ noDefaultInfinity: true, noNaN: true })
    ).map(
      ([config, zoom]) => ({ ...config, zoom })
    )

export const arbSimplexNoiseResult =
  () =>
    arbSimplexNoiseConfig()
      .map(
        config =>
          map(
            noiseFn => noiseFn(...config.params),
            simplexNoise(config)
          )
      )

describe('The simplexNoise Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbSimplexNoiseResult)
  it('should return a Generator that returns a simplex noise function for the given number of dimensions', () => {
    fc.assert(
      fc.property(
        arbSimplexNoiseConfig(),
        arbSeed(),
        ({ dimensions, y, zoom, params }, seed) => {
          const [noiseFn, nextSeed] = simplexNoise({ dimensions, y, zoom })(seed)
          expect(noiseFn.length).toBe(dimensions)
          expect(params.length).toBe(dimensions)
          expect(noiseFn(...params)).toBe(noiseFn(...params))
          expect(nextSeed).not.toBe(seed)
        }
      )
    )
  })
})
