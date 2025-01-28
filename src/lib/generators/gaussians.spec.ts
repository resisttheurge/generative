import fc from 'fast-check'
import { jsf32, mulberry32, prn, sfc32, splitmix32 } from '@prngs/arbitraries'
import { boxMullerTransform } from './gaussians'
import { Generator } from './Generator'

describe('module lib/generators/gaussians', () => {
  describe('boxMullerTransform: Generator<[number, number]>', () => {
    it('should be a Generator that returns an array of two numbers', () => {
      expect(boxMullerTransform).toBeInstanceOf(Generator)
      fc.assert(
        fc.property(
          prn<any>(fc.oneof(jsf32(), mulberry32(), sfc32(), splitmix32())), // eslint-disable-line @typescript-eslint/no-explicit-any
          state => {
            const [nextState, nextValue] = boxMullerTransform.run(state)
            expect(nextState).not.toBe(state)
            expect(nextValue).toBeInstanceOf(Array)
            expect(nextValue.length).toBe(2)
            const [first, second] = nextValue
            expect(typeof first).toBe('number')
            expect(first).not.toBeNaN()
            expect(typeof second).toBe('number')
            expect(second).not.toBeNaN()
          },
        ),
      )
    })
  })
})
