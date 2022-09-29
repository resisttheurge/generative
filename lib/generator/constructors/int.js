import { map } from '../combinators'
import { number } from './number'

export const int =
  ({ min = -2147483648, max = 2147483648 } = {}) =>
    map(Math.floor, number({ min, max }))
