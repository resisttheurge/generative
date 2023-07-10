import fc from 'fast-check'
import { Range, subdivide } from '../math/ranges'
import { nShell } from './n-shell'
import { magnitude, magnitudeSquared } from '../math/vectors'
import { Generator } from './Generator'
import { goodSeed } from '../../__tests__/__utils__/arbitraries'
import { goodnessOfFit } from '../../__tests__/__utils__/goodnessOfFit'

export const seed: () => fc.Arbitrary<number> =
  () => fc.string().map(Generator.initSeed)

export const invalidDimensions: () => fc.Arbitrary<number> =
  () => fc.oneof(
    fc.double({ max: 1, noNaN: true }).filter(n => n < 1),
    fc.constant(Infinity),
    fc.constant(NaN)
  )

export const validDimensions: () => fc.Arbitrary<number> =
  () => fc.double({ min: 1, max: 100, noDefaultInfinity: true, noNaN: true })

const invalidRadiusRangeBound: () => fc.Arbitrary<number> =
  () => fc.oneof(
    fc.double({ max: 0, noNaN: true }).filter(n => n < 0),
    fc.constant(Infinity),
    fc.constant(NaN)
  )

const validRadiusBound: () => fc.Arbitrary<number | undefined> =
  () => fc.oneof(
    fc.double({ min: 0, noNaN: true, noDefaultInfinity: true }),
    fc.constant(undefined)
  )

export const validRadiusRange: () => fc.Arbitrary<Partial<Range>> = () => fc.tuple(validRadiusBound(), validRadiusBound()).map(
  ([a, b]) => {
    if (a === undefined && b === undefined) return {}
    if (a === undefined || b === undefined) {
      const n = (a ?? b) as number
      if (n >= 0.5) return { max: n }
      else return { min: n }
    }
    return { min: Math.min(a, b), max: Math.max(a, b) }
  }
)

export const invalidRadiusRange: () => fc.Arbitrary<Partial<Range>> = () => fc.oneof(
  // min is an invalid numeric value, max is valid or undefined
  fc.record({ min: invalidRadiusRangeBound(), max: validRadiusBound() }),
  // max is an invalid numberic value, min is valid or undefined
  fc.record({ min: validRadiusBound(), max: invalidRadiusRangeBound() }),
  // both min and max are invalid numeric values
  fc.record({ min: invalidRadiusRangeBound(), max: invalidRadiusRangeBound() }),
  // min is greater than max
  validRadiusBound().chain(
    (max?: number) => fc.record({
      min: max !== undefined
        ? fc.double({ min: max, noNaN: true, noDefaultInfinity: true }).filter(n => n > max)
        : fc.double({ min: 1, noNaN: true, noDefaultInfinity: true }).filter(n => n > 1),
      max: fc.constant(max)
    })
  ),
  // max is less than min
  validRadiusBound().chain(
    (min?: number) => fc.record({
      min: fc.constant(min),
      max: min !== undefined
        ? fc.double({ max: min, noNaN: true, noDefaultInfinity: true }).filter(n => n < min)
        : fc.double({ max: 0, noNaN: true, noDefaultInfinity: true }).filter(n => n < 0)
    })
  )
)

describe('module lib/generators/n-shell', () => {
  it('should throw an assertion error if the number of dimensions is less than 1, infinite, or NaN', () => {
    fc.assert(fc.property(invalidDimensions(), dimensions => {
      expect(() => nShell(dimensions)).toThrow()
    }))
  })

  it('should throw an assertion error if the radius range is infinite, inverted (max <= min), or negative in polarity (max < 0)', () => {
    fc.assert(fc.property(validDimensions(), invalidRadiusRange(), (dimensions, radiusRange) => {
      expect(() => nShell(dimensions, radiusRange)).toThrow()
    }))
  })

  it('should generate points in the unit sphere if no radius range is specified', () => {
    fc.assert(fc.property(validDimensions(), goodSeed(), (dimensions, seed) => {
      const generator = nShell(dimensions)
      const [,vector] = generator.run(seed)
      expect(vector.length).toBe(Math.floor(dimensions))
      const m2 = magnitudeSquared(vector)
      expect(m2).toBeGreaterThanOrEqual(0)
      expect(m2).toBeLessThanOrEqual(1)
    }))
  })

  it('should generate points in the specified radius range', () => {
    fc.assert(fc.property(validDimensions(), validRadiusRange(), goodSeed(), (dimensions, radiusRange, seed) => {
      const { min = 0, max = 1 } = radiusRange
      const [min2, max2] = [min * min, max * max]
      const generator = nShell(dimensions, radiusRange)
      const [,vector] = generator.run(seed)
      expect(vector.length).toBe(Math.floor(dimensions))
      const mag2 = magnitudeSquared(vector)
      // fuzzy floating point operations mean that the magnitude may be slightly outside the expected range
      if (mag2 < min2) {
        // this is acceptable, but only if the magnitude is very close to the boundary
        expect(mag2).toBeCloseTo(min2)
      } else if (mag2 > max2) {
        expect(mag2).toBeCloseTo(max2)
      } else {
        expect(mag2).toBeGreaterThanOrEqual(min * min)
        expect(mag2).toBeLessThanOrEqual(max * max)
      }
    }))
  })

  xit('should generate points with with a uniformly distributed magnitude', () => {
    const numBins = 16
    const expectedPerBin = 1024
    const numSamples = numBins * expectedPerBin
    const expected = new Array(numBins).fill(expectedPerBin)
    const bins = subdivide({ min: 0, max: 1 }, numBins)
    fc.assert(fc.property(validDimensions(), goodSeed(), (dimensions, seed) => {
      const generator = nShell(dimensions)
      const [, samples] = generator.repeat(numSamples).run(seed)
      const observed =
          samples.reduce<number[]>(
            (acc, next) => {
              const mag = magnitude(next)
              const binIndex = bins.findIndex(bin => mag >= bin.min && mag < bin.max)
              expect(binIndex).toBeGreaterThanOrEqual(0)
              if (acc[binIndex] === undefined) {
                acc[binIndex] = 0
              }
              acc[binIndex]++
              return acc
            },
            []
          )
      // console.log(observed)
      expect(observed.reduce((a, b) => a + b)).toEqual(numSamples)
      const gof = goodnessOfFit(observed, expected)
      expect(gof.pValue).toBeGreaterThan(0.005)
    }))
  })
})
