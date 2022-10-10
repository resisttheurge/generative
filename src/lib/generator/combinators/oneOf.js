import { nat } from '../constructors'
import { flatMap } from './flatMap'

export const oneOf =
  (generators = []) =>
    flatMap(
      n => generators[n],
      nat(generators.length)
    )
