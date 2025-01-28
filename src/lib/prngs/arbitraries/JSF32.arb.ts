import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import { xmur3a } from '@hashers/arbitraries'
import {
  JSF32,
  JSF32Algorithm,
  JSF32State,
  JSF32a,
  JSF32b,
  jsf32Algorithms,
} from '@prngs/JSF32'
import { Liftable, lift } from '@utils/arbitraries'

export interface JSF32Constraints {
  hasher?: Liftable<Hasher<number>>
  algorithm?: Liftable<JSF32Algorithm>
}

export function jsf32({
  hasher = xmur3a(),
  algorithm = fc.constantFrom(...jsf32Algorithms),
}: JSF32Constraints = {}): fc.Arbitrary<JSF32> {
  return fc
    .record({
      hasher: lift(hasher),
      algorithm: lift(algorithm),
    })
    .map(({ hasher, algorithm }) => {
      if (algorithm === 'jsf32a') {
        return new JSF32a(hasher)
      } else {
        return new JSF32b(hasher)
      }
    })
}

export interface JSF32StateConstraints {
  seed?: Liftable<string>
  maxIterations?: Liftable<number>
}

export function jsf32State(
  jsf32Impl: Liftable<JSF32> = jsf32(),
  { seed = fc.string(), maxIterations = 1000 }: JSF32StateConstraints = {},
): fc.Arbitrary<JSF32State> {
  return fc
    .record({
      jsf32Impl: lift(jsf32Impl),
      seed: lift(seed),
      iterations: lift(maxIterations).chain(fc.nat),
    })
    .map(({ jsf32Impl, seed, iterations }) => {
      let state = jsf32Impl.initState(seed)
      while (iterations-- > 0) {
        state = jsf32Impl.nextState(state)
      }
      return state
    })
}
