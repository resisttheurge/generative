import fc from 'fast-check'
import { goodSeed } from '../../__tests__/__utils__/arbitraries'
import { boxMullerTransform } from './gaussians'
import { Generator } from './Generator'

describe('module lib/generators/gaussians', () => {
  describe('boxMullerTransform: Generator<[number, number]>', () => {
    it('should be a Generator that returns an array of two numbers', () => {
      expect(boxMullerTransform).toBeInstanceOf(Generator)
      fc.assert(fc.property(goodSeed(), (seed) => {
        const [nextState, nextValue] = boxMullerTransform.run(seed)
        expect(nextState).not.toBe(seed)
        expect(nextValue).toBeInstanceOf(Array)
        expect(nextValue.length).toBe(2)
        const [first, second] = nextValue
        expect(typeof first).toBe('number')
        expect(first).not.toBeNaN()
        expect(typeof second).toBe('number')
        expect(second).not.toBeNaN()
      }))
    })
  })
})
