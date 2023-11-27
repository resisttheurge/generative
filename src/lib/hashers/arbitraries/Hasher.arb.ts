import fc from 'fast-check'

import { Hasher } from '@hashers/Hasher'
import { Liftable, lift } from '@utils/arbitraries'
/**
 * Constraints for arbitrary Hasher instances.
 */
export interface HasherConstraints {
  name?: Liftable<string | undefined>
}

export function hasher (): fc.Arbitrary<Hasher<unknown>>

export function hasher <State> (
  stateArbitrary?: fc.Arbitrary<State>,
  constraints?: HasherConstraints
): fc.Arbitrary<Hasher<State>>

export function hasher (
  stateArbitrary = fc.anything(),
  {
    name = fc.option(fc.string(), { nil: undefined })
  }: HasherConstraints = {}
): fc.Arbitrary<Hasher<unknown>> {
  return fc.record({
    name: lift(name),
    initState: fc.func(stateArbitrary),
    nextState: fc.func(stateArbitrary)
  })
}
