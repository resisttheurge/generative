import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import { xmur3a } from '@hashers/arbitraries'
import { Mulberry32 } from '@prngs/Mulberry32'
import { Liftable, lift } from '@utils/arbitraries'

export interface Mulberry32Constraints {
  hasher?: Liftable<Hasher<number>>
}

export function mulberry32({
  hasher = xmur3a(),
}: Mulberry32Constraints = {}): fc.Arbitrary<Mulberry32> {
  return lift(hasher).map(hasher => new Mulberry32(hasher))
}
