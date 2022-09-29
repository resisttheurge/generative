/* eslint-env jest */

import fc from 'fast-check'

import { Generator } from '../Generator'
import { constant } from './constant'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'

export const arbConstant = (arb = fc.anything()) => arb.map(value => constant(value))

describe('The constant Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbConstant)
  it('should return a Generator that returns the given constant value without updating the seed', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        arbSeed(),
        (value, seed) => {
          const con = constant(value)
          expect(con).toBeInstanceOf(Generator)
          const [v, nextSeed] = con(seed)
          expect(nextSeed).toStrictEqual(seed)
          expect(v).toStrictEqual(value)
        }
      )
    )
  })
})
