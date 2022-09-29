/* eslint-env jest */

import fc from 'fast-check'

import { sphericalAnnulus } from './sphericalAnnulus'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'
import { map, pipe, sum } from 'ramda'

export const arbSphericalAnnulusConfig =
  () =>
    fc.tuple(
      fc.integer({ min: 1, max: 1e3 }),
      fc.float({ noDefaultInfinity: true, noNaN: true, min: Number.EPSILON, max: 2147483648 })
    ).chain(
      ([dimensions, innerRadius]) =>
        fc.float({ noDefaultInfinity: true, noNaN: true, min: innerRadius, max: 2147483648 })
        // .filter(outerRadius => outerRadius > innerRadius && (outerRadius - innerRadius) > Number.EPSILON)
          .map(
            outerRadius => ({
              dimensions,
              innerRadius,
              outerRadius
            })
          )
    )

export const arbSphericalAnnulus =
  () =>
    arbSphericalAnnulusConfig()
      .map(params => sphericalAnnulus(params))

export const magnitude2 = pipe(map(n => n * n), sum, Math.sqrt)

describe('The sphericalAnnulus Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbSphericalAnnulus)
  it('should return a Generator that returns a random point chosen uniformly within an n-spherical shell defined as within the given inner and outer radii around a given point in space', () => {
    fc.assert(
      fc.property(
        arbSphericalAnnulusConfig(),
        arbSeed(),
        (config, seed) => {
          const { dimensions, innerRadius, outerRadius } = config
          const [value, nextSeed] = sphericalAnnulus(config)(seed)
          const epsilon = outerRadius * 1e-14
          const mag2 = magnitude2(value)
          expect(mag2).toBeWithin(innerRadius - epsilon, outerRadius + epsilon)
          expect(value).toBeArrayOfSize(dimensions)
          value.forEach(n => expect(n).toBeNumber())
          expect(nextSeed).not.toStrictEqual(seed)
        }
      )
    )
  })
})
