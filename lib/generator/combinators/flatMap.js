import { curry } from 'ramda'
import { Generator } from '../Generator'

export const flatMap = curry(
  (generatorFn, generator) =>
    Generator(
      state => {
        const [value, nextState] = generator(state)
        const nextGenerator = generatorFn(value)
        return nextGenerator(nextState)
      }
    )
)
