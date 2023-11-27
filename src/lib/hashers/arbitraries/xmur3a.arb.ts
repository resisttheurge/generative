import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import * as impl from '@hashers/xmur3a'

export function xmur3a (): fc.Arbitrary<Hasher<number>> {
  return fc.constant(impl.xmur3a)
}
