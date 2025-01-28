import fc from 'fast-check'

import { SizedTuple, fill } from '@data-structures/sized-tuples'

export function sizedTuple<T, N extends number>(
  arbitrary: fc.Arbitrary<T>,
  size: N,
): fc.Arbitrary<SizedTuple<T, N>> {
  return fc.tuple(...fill(arbitrary, size)) as fc.Arbitrary<SizedTuple<T, N>>
}
