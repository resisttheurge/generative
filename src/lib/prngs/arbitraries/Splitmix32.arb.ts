import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import { xmur3a } from '@hashers/arbitraries'
import { Splitmix32, Splitmix32Algorithm, Splitmix32a, Splitmix32b, splitmix32Algorithms } from '@prngs/Splitmix32'
import { Liftable, lift } from '@utils/arbitraries'

export interface Splitmix32Constraints {
  hasher?: Liftable<Hasher<number>>
  algorithm?: Liftable<Splitmix32Algorithm>
}

export function splitmix32 (
  {
    hasher = xmur3a(),
    algorithm = fc.constantFrom(...splitmix32Algorithms)
  }: Splitmix32Constraints = {}
): fc.Arbitrary<Splitmix32> {
  return fc.record({
    hasher: lift(hasher),
    algorithm: lift(algorithm)
  }).map(({ hasher, algorithm }) => {
    if (algorithm === 'splitmix32a') {
      return new Splitmix32a(hasher)
    } else {
      return new Splitmix32b(hasher)
    }
  })
}
