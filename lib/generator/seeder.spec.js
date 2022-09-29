/* eslint-env jest */

import fc from 'fast-check'

import { seed, nextSeed } from './seeder'

export const arbSeed = () => fc.string().map(seed)

describe('The seed function', () => {
  it('should return a 32-bit integer for any given input string', () => {
    fc.assert(
      fc.property(
        arbSeed(),
        s => {
          expect(s).toBeInteger()
          expect(s).toBeGreaterThanOrEqual(-Math.pow(2, 31))
          expect(s).toBeLessThan(Math.pow(2, 31))
        }
      )
    )
  })
  it('should return the same seed when give the same input string', () => {
    fc.assert(
      fc.property(
        fc.string(),
        initString => {
          const s1 = seed(initString)
          const s2 = seed(initString)
          expect(s1).toStrictEqual(s2)
        }
      )
    )
  })
  it('should return a different seed when given a different input string', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (initString1, initString2) => {
          fc.pre(initString1 !== initString2)
          const seed1 = seed(initString1)
          const seed2 = seed(initString2)
          expect(seed1).not.toStrictEqual(seed2)
        }
      )
    )
  })
})

describe('the nextSeed function', () => {
  it('should return a 32-bit integer for any given seed', () => {
    fc.assert(
      fc.property(
        arbSeed(),
        s => {
          const n = nextSeed(s)
          expect(n).toBeInteger()
          expect(n).toBeGreaterThanOrEqual(-Math.pow(2, 31))
          expect(n).toBeLessThan(Math.pow(2, 31))
        }
      )
    )
  })
  it('should always return the same value when given the same seed', () => {
    fc.assert(
      fc.property(
        arbSeed(),
        s => {
          expect(nextSeed(s)).toStrictEqual(nextSeed(s))
        }
      )
    )
  })
  it('should always return a different value when given a different seed', () => {
    fc.assert(
      fc.property(
        arbSeed(),
        arbSeed(),
        (s1, s2) => {
          fc.pre(s1 !== s2)
          expect(nextSeed(s1)).not.toStrictEqual(nextSeed(s2))
        }
      )
    )
  })
})
