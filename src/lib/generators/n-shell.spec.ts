import fc from 'fast-check'

import { jsf32, mulberry32, prn, sfc32, splitmix32 } from '@prngs/arbitraries'
import { Range } from '../math/ranges'
import { nShell } from './n-shell'
import { magnitudeSquared } from '../math/vectors'

export const invalidDimensions: () => fc.Arbitrary<number> =
  () => fc.oneof(
    fc.double({ max: 1, noNaN: true }).filter(n => n < 1),
    fc.constant(Infinity),
    fc.constant(NaN)
  )

export const validDimensions: () => fc.Arbitrary<number> =
  () => fc.double({ min: 1, max: 10, noDefaultInfinity: true, noNaN: true })

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
    fc.assert(fc.property(validDimensions(), prn<any>(fc.oneof(jsf32(), mulberry32(), sfc32(), splitmix32())), (dimensions, seed) => {
      const generator = nShell(dimensions)
      const [,vector] = generator.run(seed)
      expect(vector.length).toBe(Math.floor(dimensions))
      const m2 = magnitudeSquared(vector)
      expect(m2).toBeGreaterThanOrEqual(0)
      expect(m2).toBeLessThanOrEqual(1)
    }))
  })

  it('should generate points in the specified radius range', () => {
    fc.assert(fc.property(validDimensions(), validRadiusRange(), prn<any>(fc.oneof(jsf32(), mulberry32(), sfc32(), splitmix32())), (dimensions, radiusRange, seed) => {
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
})
