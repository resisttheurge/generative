/* eslint-env jest */

import fc from 'fast-check'
import { arbGenerator } from '../index.spec'
import { arbSeed } from '../seeder.spec'

import { repeat } from './repeat'
import { tuple } from './tuple'

describe('The repeat function', () => {
  it('should return a Generator that functions by calling the given generator a given number of times and returning an array of the results', () => {
    fc.assert(
      fc.property(
        arbGenerator(),
        fc.nat(1e3),
        arbSeed(),
        (gen, count, seed) => {
          let [result, currentSeed] = [[], seed]
          for (let i = 0; i < count; i++) {
            const [nextVal, nextSeed] = gen(currentSeed)
            result.push(nextVal)
            currentSeed = nextSeed
          }
          expect(repeat(count, gen)(seed)).toStrictEqual([result, currentSeed])
        }
      )
    )
  })
  it('should be strictly equal to tuple([...gens]) where gens is an array as long as the given count of the given generator', () => {
    fc.assert(
      fc.property(
        arbGenerator(),
        fc.nat(1e3),
        arbSeed(),
        (gen, count, seed) => {
          const gens = (new Array(count)).fill(gen)
          expect(repeat(count, gen)(seed)).toStrictEqual(tuple(gens)(seed))
        }
      )
    )
  })
})
