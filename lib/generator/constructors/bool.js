import { map } from '../combinators'
import { uniform } from '../instances/uniform'

export const bool =
  (threshold = 0.5) =>
    map(
      n => n >= (1 - threshold),
      uniform
    )
