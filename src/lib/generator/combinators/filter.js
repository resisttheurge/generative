import { curry } from 'ramda'
import { Generator } from '../Generator'

export const filter = curry(
  (predicate, generator) =>
    Generator(
      seed => {
        let [acc, currentSeed] = generator(seed)
        while (!predicate(acc)) {
          const [next, nextSeed] = generator(currentSeed)
          acc = next
          currentSeed = nextSeed
        }
        return [acc, currentSeed]
      }
    )
)
