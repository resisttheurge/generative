import fc from 'fast-check'
import { next } from './splitmix32'
import { subdivide, toString } from './ranges'
import { mapAccum, range } from 'ramda'
import { goodnessOfFit } from '../../__tests__/__utils__/goodnessOfFit'
import { anySeed, doubleBoundary, goodSeed, invalidSeed, validSeed } from '../../__tests__/__utils__/arbitraries'

describe('module lib/math/splitmix32.ts', () => {
  describe('next(seed: number): [number, number]', () => {
    it('should be a Function that takes a single number as an argument and returns an array of two numbers', () => {
      expect(next).toBeInstanceOf(Function)
      expect(next.length).toBe(1)
      fc.assert(fc.property(anySeed(), (seed) => {
        const result = next(seed)
        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBe(2)

        const [nextValue, nextSeed] = result
        expect(typeof nextSeed).toBe('number')
        expect(typeof nextValue).toBe('number')
      }))
    })

    it('should return at index 1 the next value in the pseudo-random number sequence, a number in the range [0, 1), when passed any seed', () => {
      fc.assert(fc.property(anySeed(), (seed) => {
        const [,nextValue] = next(seed)
        expect(nextValue).toBeGreaterThanOrEqual(0)
        expect(nextValue).toBeLessThan(1)
      }))
    })

    it('should return at index 0 the next seed for the PRNG, a max-32-bit integer that is different from the seed passed to it', () => {
      fc.assert(fc.property(anySeed(), (seed) => {
        const [nextSeed] = next(seed)
        expect(nextSeed).toEqual(Math.round(nextSeed))
        const bits = nextSeed < 0 ? nextSeed.toString(2).slice(1) : nextSeed.toString(2)
        expect(bits.length).toBeLessThanOrEqual(32)
        expect(nextSeed).not.toEqual(seed)
      }))
    })

    it('should always return the same result (next value and seed) when passed the same initial seed', () => {
      fc.assert(fc.property(anySeed(), (seed) => {
        const result1 = next(seed)
        const result2 = next(seed)
        expect(result1).toEqual(result2)
      }))
    })

    it('should always return different results (next value and/or seed) when passed different valid initial seeds', () => {
      fc.assert(fc.property(validSeed(), validSeed(), (seed1, seed2) => {
        fc.pre((seed1 | 0) !== (seed2 | 0))
        const result1 = next(seed1)
        const result2 = next(seed2)
        expect(result1).not.toEqual(result2)
      }), { examples: [[4.835703278458517e+24, -4.835703854919269e+24]] })
    })

    it(`should always return next(0) when passed an invalid seed, such as NaN, +/-Infinity, or any value outside ${toString(doubleBoundary)}`, () => {
      const zero = next(0)
      fc.assert(fc.property(invalidSeed(), (seed) => {
        const result = next(seed)
        expect(result).toEqual(zero)
      }))
    })

    xit('should produce values in the range [0, 1) that are uniformly distributed when given a good seed', () => {
      const numBins = 16
      const expectedPerBin = 1024
      const numSamples = numBins * expectedPerBin
      const expected = new Array(numBins).fill(expectedPerBin)
      const bins = subdivide({ min: 0, max: 1 }, numBins)
      fc.assert(fc.property(goodSeed(), (seed) => {
        const [, samples] = mapAccum(next, seed, range(0, numSamples))
        const observed =
          samples.reduce<number[]>(
            (acc, next) => {
              const binIndex = bins.findIndex(bin => next >= bin.min && next < bin.max)
              expect(binIndex).toBeGreaterThanOrEqual(0)
              if (acc[binIndex] === undefined) {
                acc[binIndex] = 0
              }
              acc[binIndex]++
              return acc
            },
            []
          )
        expect(observed.reduce((a, b) => a + b)).toEqual(numSamples)
        const gof = goodnessOfFit(observed, expected)
        expect(gof.pValue).toBeGreaterThan(0.0025)
      }))
    })
  })
})
