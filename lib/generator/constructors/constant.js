import { Generator } from '../Generator'

export const constant =
  value =>
    Generator(
      state =>
        [value, state]
    )
