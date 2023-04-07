import { mapAccum } from 'ramda'
import { Generator } from '../Generator'

export const record =
  (shape = {}) =>
    Generator(
      seed => {
        const [finalSeed, entries] = mapAccum(
          (currentSeed, [nextKey, nextGenerator]) => {
            const [generatedValue, nextSeed] = nextGenerator(currentSeed)
            return [nextSeed, [nextKey, generatedValue]]
          },
          seed,
          Object.entries(shape)
        )
        return [Object.fromEntries(entries), finalSeed]
      }

    )
