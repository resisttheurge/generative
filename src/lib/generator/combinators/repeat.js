import { curry } from 'ramda'
import { Generator } from '../Generator'

export const repeat = curry(
  (count, generator) =>
    Generator(
      seed => {
        let [result, currentSeed] = [[], seed]
        for (let i = 0; i < count; i++) {
          const [nextValue, nextSeed] = generator(currentSeed)
          result.push(nextValue)
          currentSeed = nextSeed
        }
        return [result, currentSeed]
      }
    )
)
