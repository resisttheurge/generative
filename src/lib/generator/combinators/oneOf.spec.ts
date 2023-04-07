/* eslint-env jest */

import fc from 'fast-check'
import { nat } from '../constructors'
import { arbGenerator } from '../index.spec'
import { arbSeed } from '../seeder.spec'

import { oneOf } from './oneOf'

describe('The oneOf function', () => {
  it('should return a Generator that functions applying the given function to the result of the given Generator', () => {
    fc.assert(
      fc.property(
        fc.array(arbGenerator(), { minLength: 1 }),
        arbSeed(),
        (gens, seed) => {
          const [idx, idxSeed] = nat(gens.length)(seed)
          expect(oneOf(gens)(seed)).toStrictEqual(gens[idx](idxSeed))
        }
      )
    )
  })
})
