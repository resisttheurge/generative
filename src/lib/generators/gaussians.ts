import { inRange, Range } from '../math/ranges'
import { scale, transform, translate, Vector } from '../math/vectors'
import { Generator } from './Generator'

const TWO_PI = 2 * Math.PI

export interface NormalConfig {
  normalize: boolean
  mu: number
  sigma: number
  truncate: Range
  strategy: 'box-muller' | 'polar' // limiting choice of algorithm artificially for now - could be a generator passed in by the user
  extras: 'discard' | 'reuse' // determines whether or not the generator tries to keep track of "extra values". Creates impurity but might be more performant in some circumstances
}

/**
 * normal distribution generator taken from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Implementation
 */
export const boxMullerTransform: Generator<Vector<2>> = Generator.tuple([
  Generator.uniform.filter(n => n > 0),
  Generator.uniform.filter(n => n > 0),
]).map(([u1, u2]) => {
  const mag = Math.sqrt(-2.0 * Math.log(u1))
  const z0 = mag * Math.cos(TWO_PI * u2)
  const z1 = mag * Math.sin(TWO_PI * u2)
  return [z0, z1]
})

/**
 * normal distribution generator taken from https://en.wikipedia.org/wiki/Marsaglia_polar_method
 */
export const marsagliaPolarMethod: Generator<Vector<2>> = Generator.tuple([
  Generator.number({ min: -1, max: 1 }),
  Generator.number({ min: -1, max: 1 }),
])
  .map(([u1, u2]) => ({ u1, u2, s: u1 * u1 + u2 * u2 }))
  .filter(({ s }) => s < 1 && s > 0)
  .map(({ u1, u2, s }) => {
    const mag = Math.sqrt((-2.0 * Math.log(s)) / s)
    const z0 = u1 * mag
    const z1 = u2 * mag
    return [z0, z1]
  })

/**
 * Creates a guassian (normally-distributed) random number pair generator according to the given configuration.
 * By default, it returns an unbounded standard normal distribution, with a mean (`mu`) of 0 and a standard deviation (`sigma`) of 1.
 */
export function gaussianPair({
  normalize = false,
  extras = 'discard',
  mu = normalize ? 0.5 : 0,
  sigma = normalize ? 1 / 6 : 1,
  truncate = normalize ? { min: 0, max: 1 } : undefined,
  strategy = truncate === undefined || extras === 'reuse'
    ? 'box-muller' // strategy defaults to box-muller if results are not truncated or partially truncated results are reused
    : 'polar', // otherwise defaults to polar for "better performance" (untested)
}: Partial<NormalConfig> = {}): Generator<Vector<2>> {
  let generator = // choose pair generation strategy and spread it into a single number generator
    strategy === 'box-muller' ? boxMullerTransform : marsagliaPolarMethod

  generator =
    mu !== 0 && sigma !== 1 // bake in a linear transformation if requested
      ? generator.map(vector => transform<2>(vector, sigma, mu))
      : mu !== 0
        ? generator.map(vector => translate<2>(vector, mu))
        : sigma !== 1
          ? generator.map(vector => scale<2>(vector, sigma))
          : generator

  return truncate !== undefined
    ? extras === 'discard'
      ? generator.filter(vector => vector.every(inRange(truncate)))
      : Generator.spread(generator).filter(inRange(truncate)).repeat(2)
    : generator
}

export function gaussian(
  config: Partial<NormalConfig> = {},
): Generator<number> {
  const { extras = 'discard' } = config
  const generator = gaussianPair(config)
  return extras === 'discard'
    ? generator.map(([first]) => first)
    : Generator.spread(generator)
}

export function gaussianVector<N extends number>(
  count: N,
  config: Partial<NormalConfig> = {},
): Generator<Vector<N>> {
  const { extras = 'discard' } = config
  return extras === 'discard'
    ? gaussianPair(config)
        .repeat(Math.ceil(count / 2))
        .map(
          ([pair, ...pairs]) =>
            pair.concat(...pairs).slice(0, count) as Vector<N>,
        )
    : gaussian(config).repeat(count)
}
