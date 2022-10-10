import { map } from '../combinators'
import { uniform } from '../instances/uniform'

export const number =
  ({ min = -2147483648, max = 2147483648 } = {}) =>
    map(
      n => min + (n * (max - min)),
      uniform
    )
