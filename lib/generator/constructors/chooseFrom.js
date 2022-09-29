import { map } from '../combinators'
import { nat } from './nat'

export const chooseFrom =
  (constants = []) =>
    map(
      n => constants[n],
      nat(constants.length)
    )
