/* eslint-env jest */

import fc from 'fast-check'

import * as index from './index'
import { blueNoise } from './blueNoise'
import { bool } from './bool'
import { chooseFrom } from './chooseFrom'
import { constant } from './constant'
import { int } from './int'
import { nat } from './nat'
import { normal } from './normal'
import { number } from './number'
import { ofShape } from './ofShape'
import { simplexNoise1d, simplexNoise2d, simplexNoise3d, simplexNoise4d } from './simplexNoise'
import { sphericalAnnulus } from './sphericalAnnulus'

import { arbSeed } from '../seeder.spec'
import { Generator } from '../Generator'

export const shouldBeAGeneratorConstructor = (arbGen) => {
  it('should return a Generator', () => {
    fc.assert(
      fc.property(
        arbGen(),
        arbSeed(),
        arbSeed(),
        (gen, seed1, seed2) => {
          fc.pre(seed1 !== seed2)
          expect(gen).toBeInstanceOf(Generator)
          expect(gen(seed1)).toStrictEqual(gen(seed1))
          expect(gen(seed2)).not.toStrictEqual(gen(seed1))
        }
      )
    )
  })
}

describe('the generator/constructors/index.js module', () => {
  it('should export these members of blueNoise.js: { blueNoise }', () => {
    expect(index.blueNoise).toBeDefined()
    expect(index.blueNoise).toBe(blueNoise)
  })
  it('should export these members of bool.js: { bool }', () => {
    expect(index.bool).toBeDefined()
    expect(index.bool).toBe(bool)
  })
  it('should export these members of chooseFrom.js: { chooseFrom }', () => {
    expect(index.chooseFrom).toBeDefined()
    expect(index.chooseFrom).toBe(chooseFrom)
  })
  it('should export these members of constant.js: { constant }', () => {
    expect(index.constant).toBeDefined()
    expect(index.constant).toBe(constant)
  })
  it('should export these members of int.js: { int }', () => {
    expect(index.int).toBeDefined()
    expect(index.int).toBe(int)
  })
  it('should export these members of nat.js: { nat }', () => {
    expect(index.nat).toBeDefined()
    expect(index.nat).toBe(nat)
  })
  it('should export these members of normal.js: { normal }', () => {
    expect(index.normal).toBeDefined()
    expect(index.normal).toBe(normal)
  })
  it('should export these members of number.js: { number }', () => {
    expect(index.number).toBeDefined()
    expect(index.number).toBe(number)
  })
  it('should export these members of ofShape.js: { ofShape }', () => {
    expect(index.ofShape).toBeDefined()
    expect(index.ofShape).toBe(ofShape)
  })
  it('should export these members of simplexNoise.js: { simplexNoise1d, simplexNoise2d, simplexNoise3d, simplexNoise4d }', () => {
    expect(index.simplexNoise1d).toBeDefined()
    expect(index.simplexNoise1d).toBe(simplexNoise1d)
    expect(index.simplexNoise2d).toBeDefined()
    expect(index.simplexNoise2d).toBe(simplexNoise2d)
    expect(index.simplexNoise3d).toBeDefined()
    expect(index.simplexNoise3d).toBe(simplexNoise3d)
    expect(index.simplexNoise4d).toBeDefined()
    expect(index.simplexNoise4d).toBe(simplexNoise4d)
  })
  it('should export these members of sphericalAnnulus.js: { sphericalAnnulus }', () => {
    expect(index.sphericalAnnulus).toBe(sphericalAnnulus)
  })
})
