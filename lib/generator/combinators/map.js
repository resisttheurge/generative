import { curry } from 'ramda'
import { Generator } from '../Generator'

export const map = curry(
  (mapperFn, generator) =>
    Generator(
      seed => {
        const [value, nextSeed] = generator(seed)
        return [mapperFn(value), nextSeed]
      }
    )
)
