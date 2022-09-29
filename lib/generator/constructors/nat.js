import { int } from './int'

export const nat =
  (max = 2147483648) =>
    int({ max, min: 0 })
