import { inRange, Range } from '../math/ranges'
import { Generator } from './Generator'

export interface ParetoConfig {
  alpha: number
  xm: number
  normalize: boolean
  truncate: Range
}

const uniform = Generator.number({ min: Number.EPSILON, max: 1 })

// Adapted from https://en.wikipedia.org/wiki/Pareto_distribution#Random_variate_generation
export const paretoDistribution = (config: Partial<ParetoConfig>): Generator<number> => {
  const {
    alpha = 1,
    xm = 1,
    normalize = true,
    truncate = normalize
      ? { min: 0, max: 1 }
      : undefined
  } = config
  let generator = uniform.map(u => xm / Math.pow(u, 1 / alpha))

  generator = normalize
    ? generator.map(n => n - xm)
    : generator

  return truncate !== undefined
    ? generator.filter(inRange(truncate))
    : generator
}
