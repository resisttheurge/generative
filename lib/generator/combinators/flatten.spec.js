/* eslint-env jest */

import fc from 'fast-check'
import { arbGenerator } from '../index.spec'
import { arbSeed } from '../seeder.spec'
import { flatMap } from './flatMap'

import { flatten } from './flatten'

describe('The flatten function', () => {
  it('should return a Generator that functions by passing the nextSeed from the given generater to its own return value, which is expected to also be a generator', () => {
    fc.assert(
      fc.property(
        arbGenerator(arbGenerator()),
        arbSeed(),
        (gengen, seed) => {
          const [gen, nextSeed] = gengen(seed)
          expect(flatten(gengen)(seed)).toStrictEqual(gen(nextSeed))
        }
      )
    )
  })
  it('should should be strictly equivalent to flatMap of the identity function: flatten(gen) === flatMap(id, gen)', () => {
    fc.assert(
      fc.property(
        arbGenerator(arbGenerator()),
        arbSeed(),
        (gen, seed) => {
          expect(flatten(gen)(seed)).toStrictEqual(flatMap(x => x, gen)(seed))
        }
      )
    )
  })
})
