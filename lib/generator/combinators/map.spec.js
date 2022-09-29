/* eslint-env jest */

import fc from 'fast-check'
import { compose } from 'ramda'
import { constant } from '../constructors'
import { arbGenerator } from '../index.spec'
import { arbSeed } from '../seeder.spec'
import { flatMap } from './flatMap'

import { map } from './map'

describe('The map function', () => {
  it('should return a Generator that functions applying the given function to the result of the given Generator', () => {
    fc.assert(
      fc.property(
        fc.func(fc.anything()),
        arbGenerator(),
        arbSeed(),
        (f, gen, seed) => {
          const [genVal, genNextSeed] = gen(seed)
          const [mapGenVal, mapGenNextSeed] = map(f, gen)(seed)
          expect(mapGenVal).toBe(f(genVal))
          expect(mapGenNextSeed).toBe(genNextSeed)
        }
      )
    )
  })
  it('should preserve identity: map(id) === id', () => {
    fc.assert(
      fc.property(
        arbGenerator(),
        arbSeed(),
        (gen, seed) => {
          expect(map(x => x)(gen)(seed)).toStrictEqual((x => x)(gen)(seed))
        }
      )
    )
  })
  it('should preserve composition: map(f . g) === map(f) . map(g)', () => {
    fc.assert(
      fc.property(
        fc.func(fc.anything()),
        fc.func(fc.anything()),
        arbGenerator(),
        arbSeed(),
        (f, g, gen, seed) => {
          expect(map(compose(f, g))(gen)(seed)).toStrictEqual(compose(map(f), map(g))(gen)(seed))
        }
      )
    )
  })
  it('should should be strictly equivalent to flatMap of the given function composed with constant: map(f, gen) === flatMap(constant o f, gen)', () => {
    fc.assert(
      fc.property(
        fc.func(fc.anything()),
        arbGenerator(),
        arbSeed(),
        (f, gen, seed) => {
          expect(map(f, gen)(seed)).toStrictEqual(flatMap(compose(constant, f), gen)(seed))
        }
      )
    )
  })
})
