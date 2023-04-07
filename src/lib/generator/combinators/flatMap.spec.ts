/* eslint-env jest */

import fc from 'fast-check'
import { arbGenerator } from '../index.spec'
import { arbSeed } from '../seeder.spec'

import { flatMap } from './flatMap'
import { flatten } from './flatten'
import { map } from './map'

describe('The flatMap function', () => {
  it('should return a Generator that functions by mapping the given Generator by the given function and flattening the result', () => {
    fc.assert(
      fc.property(
        fc.func(arbGenerator()),
        arbGenerator(),
        arbSeed(),
        (f, gen, seed) => {
          const [val, nextSeed] = gen(seed)
          expect(flatMap(f, gen)(seed)).toStrictEqual(f(val)(nextSeed))
        }
      )
    )
  })
  it('should should be strictly equivalent to flatten composed with map: flatMap(f, gen) === (flatten o map)(f, gen)', () => {
    fc.assert(
      fc.property(
        fc.func(arbGenerator()),
        arbGenerator(),
        arbSeed(),
        (f, gen, seed) => {
          expect(flatMap(f, gen)(seed)).toStrictEqual(flatten(map(f, gen))(seed))
        }
      )
    )
  })
})
