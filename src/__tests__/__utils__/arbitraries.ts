import fc, { Arbitrary, StringSharedConstraints } from 'fast-check'
import { hashString } from '../../lib/math/xmur3a'
import { Range } from '../../lib/math/ranges'
import { SizedTuple, fill } from '../../lib/data-structures/sized-tuples'

/**
 * Creates a fast-check Arbitrary<number> that generates strings that are good seeds for mulberry32
 *
 * A good seed is one that has been generated by calling an appropriate hash function on a string
 * of characters. This function maps the xmur3a hash function over an arbitrary fast-check string to
 * generate a good seed.
 *
 * @param constraints the constraints on the strings generated by the function. same as fast-check's
 *                    `fc.string()` constraints
 * @returns an arbitrary number that is guaranteed to be a good seed for mulberry32
 */
export const goodSeed: (constraints?: StringSharedConstraints) => Arbitrary<number> =
  (constraints?: StringSharedConstraints) =>
    fc.string(constraints)
      .map(string => hashString(string))

/**
 * magic double bitwise implosion boundary
 *
 * This range (exclusive) represents doubles that can safely be used as seeds for mulberry32
 * Outside of this range, and including the boundaries and NaN, the results of mulberry32 will
 * always be [0, 0]. I don't understand enough of the bitwise math to explain why this is the case,
 * but it is.
 */
export const doubleBoundary: Range = {
  min: -1.9342815419677076e+25,
  max: 1.9342813113834067e+25
} as const

export const floatBoundary: Range = {
  min: new Float32Array([doubleBoundary.min])[0],
  max: new Float32Array([doubleBoundary.max])[0]
}

/**
 * Creates a fast-check Arbitrary<number> that generates valid seeds for mulberry32
 *
 * @returns an arbitrary number that is guaranteed to be a valid seed for mulberry32
 */
export const validSeed: () => Arbitrary<number> =
  () => fc.oneof(
    goodSeed(),
    fc.nat(),
    fc.integer(),
    fc.float({
      ...floatBoundary,
      noDefaultInfinity: true,
      noNaN: true
    }).map(n => Math.round(n)),
    fc.double({
      ...doubleBoundary,
      noDefaultInfinity: true,
      noNaN: true
    }).map(n => Math.round(n))
  )

/**
 * Creates a fast-check Arbitrary<number> that generates invalid seeds for mulberry32
 *
 * @returns an arbitrary number that is guaranteed to be an invalid seed for mulberry32
 */
export const invalidSeed: () => Arbitrary<number> =
  () => fc.oneof(
    fc.constant(NaN),
    fc.float({ max: floatBoundary.min, noNaN: true }),
    fc.float({ min: floatBoundary.max, noNaN: true }),
    fc.double({ max: doubleBoundary.min, noNaN: true }),
    fc.double({ min: doubleBoundary.max, noNaN: true })
  )

export const anySeed: () => Arbitrary<number> =
  () => fc.oneof(
    validSeed(),
    invalidSeed()
  )

export const sizedTuple: <T, N extends number> (arbitrary: Arbitrary<T>, size: N) => Arbitrary<SizedTuple<T, N>> =
    <T, N extends number> (arbitrary: Arbitrary<T>, size: N) => fc.tuple(...fill(arbitrary, size)) as Arbitrary<SizedTuple<T, N>>
