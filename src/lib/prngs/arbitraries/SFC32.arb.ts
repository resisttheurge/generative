import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import { xmur3a } from '@hashers/arbitraries'
import {
  SFC32,
  SFC32Algorithm,
  SFC32State,
  SFC32a,
  SFC32b,
  SFC32c,
  sfc32Algorithms,
} from '@prngs/SFC32'
import { Liftable, lift } from '@utils/arbitraries'

export interface SFC32Constraints {
  hasher?: Liftable<Hasher<number>>
  algorithm?: Liftable<SFC32Algorithm>
}

export function sfc32({
  hasher = xmur3a(),
  algorithm = fc.constantFrom(...sfc32Algorithms),
}: SFC32Constraints = {}): fc.Arbitrary<SFC32> {
  return fc
    .record({
      hasher: lift(hasher),
      algorithm: lift(algorithm),
    })
    .map(({ hasher, algorithm }) => {
      if (algorithm === 'sfc32a') {
        return new SFC32a(hasher)
      } else if (algorithm === 'sfc32b') {
        return new SFC32b(hasher)
      } else {
        return new SFC32c(hasher)
      }
    })
}

export interface SFC32StateConstraints {
  seed?: Liftable<string>
  maxIterations?: Liftable<number>
}

export function sfc32State(
  sfc32Impl: Liftable<SFC32> = sfc32(),
  { seed = fc.string(), maxIterations = 1000 }: SFC32StateConstraints = {},
): fc.Arbitrary<SFC32State> {
  return fc
    .record({
      sfc32Impl: lift(sfc32Impl),
      seed: lift(seed),
      iterations: lift(maxIterations).chain(fc.nat),
    })
    .map(({ sfc32Impl, seed, iterations }) => {
      let state = sfc32Impl.initState(seed)
      while (iterations-- > 0) {
        state = sfc32Impl.nextState(state)
      }
      return state
    })
}
