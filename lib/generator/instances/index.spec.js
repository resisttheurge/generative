/* eslint-env jest */

import fc from 'fast-check'

import * as index from './index'
import { uniform } from './uniform'

import { Generator } from '../Generator'
import { arbSeed } from '../seeder.spec'

export const shouldBeAGenerator = (gen) => {
  expect(gen).toBeInstanceOf(Generator)
  it('should be a Generator', () => {
    fc.assert(
      fc.property(
        arbSeed(),
        arbSeed(),
        (seed1, seed2) => {
          fc.pre(seed1 !== seed2)
          expect(gen(seed1)).toStrictEqual(gen(seed1))
          expect(gen(seed2)).not.toStrictEqual(gen(seed1))
        }
      )
    )
  })
}

describe('the generator/instances/index.js module', () => {
  it('should export these members of uniform.js: { uniform }', () => {
    expect(index.uniform).toBeDefined()
    expect(index.uniform).toBe(uniform)
  })
})
