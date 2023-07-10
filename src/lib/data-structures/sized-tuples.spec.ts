import fc from 'fast-check'
import { cartesianProduct } from './sized-tuples'

const optionLists: () => fc.Arbitrary<number[][]> = () => fc.array(fc.array(fc.integer(), { minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 10 })

describe('module lib/data-structures/sized-tuples.ts', () => {
  describe('cartesianProduct <T, Dimensions extends number> (optionLists: SizedTuple<T[], Dimensions>): Array<SizedTuple<T, Dimensions>>', () => {
    it('should generate a valid list of variations', () => {
      fc.assert(fc.property(optionLists(), (optionLists) => {
        const varied = cartesianProduct(optionLists)
        expect(varied).toBeInstanceOf(Array)
        expect(varied.length).toBe(optionLists.reduce((acc, optionList) => acc * optionList.length, 1))
        expect(varied.every((vector) => vector.length === optionLists.length)).toBe(true)
        optionLists.forEach((optionList, i) => {
          optionList.forEach((option, j) => {
            expect(varied.some((vector) => vector[i] === option)).toBeTruthy()
          })
        })
      }))
    })
  })
})
