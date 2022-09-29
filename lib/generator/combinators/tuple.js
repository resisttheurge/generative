import { mapAccum } from 'ramda'
import { Generator } from '../Generator'

export const tuple =
  (generators = []) =>
    Generator(
      seed =>
        mapAccum(
          (currentSeed, nextGenerator) => {
            const [value, nextSeed] = nextGenerator(currentSeed)
            return [nextSeed, value]
          },
          seed,
          generators
        ).reverse()
    )
