/* eslint-env jest */

import * as index from './index'
import * as combinators from './combinators'
import * as constructors from './constructors'
import * as instances from './instances'
import { symbol, isGenerator, Generator } from './Generator'
import { seed, nextSeed } from './seeder'
import fc from 'fast-check'
import { map } from './combinators'
import { uniform } from './instances'

export const arbGenerator =
  (arb = fc.anything()) =>
    fc.func(arb)
      .map(f => map(f, uniform))

describe('the generator/index.js module', () => {
  it('should export all members of generator/constructors', () => {
    Object.entries(combinators)
      .forEach(([key, value]) => {
        expect(index[key]).toBeDefined()
        expect(index[key]).toStrictEqual(value)
      })
  })
  it('should export all members of generator/constructors', () => {
    Object.entries(constructors)
      .forEach(([key, value]) => {
        expect(index[key]).toBeDefined()
        expect(index[key]).toStrictEqual(value)
      })
  })
  it('should export all members of generator/instances', () => {
    Object.entries(instances)
      .forEach(([key, value]) => {
        expect(index[key]).toBeDefined()
        expect(index[key]).toStrictEqual(value)
      })
  })
  it('should export these members of Generator.js: { symbol, isGenerator, Generator }', () => {
    expect(index.symbol).toBeDefined()
    expect(index.symbol).toBe(symbol)
    expect(index.isGenerator).toBeDefined()
    expect(index.isGenerator).toBe(isGenerator)
    expect(index.Generator).toBeDefined()
    expect(index.Generator).toBe(Generator)
  })
  it('should export these members of seeder.js: { seed, nextSeed }', () => {
    expect(index.seed).toBeDefined()
    expect(index.seed).toBe(seed)
    expect(index.nextSeed).toBeDefined()
    expect(index.nextSeed).toBe(nextSeed)
  })
})
