import { Range, validate } from '../math/ranges'
import { Vector, normalize } from '../math/vectors'
import { Generator } from './Generator'
import { gaussianVector } from './gaussians'
import invariant from 'tiny-invariant'

/**
 * Generates a random point in the n-demnsional spherical shell with range.min < radius < range.max.
 * By default, generates points in the unit n-sphere (0 < radius < 1)
 *
 * adapted from https://math.stackexchange.com/a/87238 by way of https://math.stackexchange.com/a/1113326
 *
 * @param dimensions the number of dimensions of the shell
 * @param rRange the mininmum and maximum radius of the shell. Defaults to the unit sphere.
 */
export function nShell<N extends number>(
  dimensions: N,
  radiusRange: Partial<Range> = {},
): Generator<Vector<N>> {
  invariant(
    dimensions >= 1,
    () => `dimensions must be equal to or greater than 0, got ${dimensions}`,
  )
  invariant(
    dimensions !== Infinity,
    () => `dimensions must be finite, got ${dimensions}`,
  )
  invariant(
    !isNaN(dimensions),
    () => `dimensions must be a number, got ${dimensions}`,
  )
  const { min = 0, max = 1 } = radiusRange
  validate({ min, max }, { finite: true, polarity: 'positive' })
  return Generator.record({
    radius: Generator.number({ min, max }), // choose radius in given range
    vector: gaussianVector(dimensions), // generate normally-distributed vector
  }).map(
    ({ radius, vector }) => normalize(vector, radius), // return vector scaled to radius
  )
}
