import { fc, it } from '@fast-check/jest'

import { hasher } from '@hashers/arbitraries'
import * as arb from './Mulberry32.arb'
import * as impl from '@prngs/Mulberry32'

describe('an arbitrary Mulberry32 implementation', () => {
  it.prop([arb.mulberry32()])(
    'should always be an instance of the canonical implementation',
    mulberry32 => {
      expect(mulberry32).toBeInstanceOf(impl.Mulberry32)
    },
  )

  it.prop({
    hasher: hasher(fc.integer()),
    seed: fc.string(),
    state: fc.integer(),
  })(
    'should allow the caller to provide a concrete or arbitrary hasher',
    ({ hasher, seed, state }) => {
      const concrete = fc.sample(arb.mulberry32({ hasher }), 1)[0]
      expect(concrete.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(concrete.hasher.nextState(state)).toBe(hasher.nextState(state))

      const arbitrary = fc.sample(
        arb.mulberry32({ hasher: fc.constant(hasher) }),
        1,
      )[0]
      expect(arbitrary.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(arbitrary.hasher.nextState(state)).toBe(hasher.nextState(state))
    },
  )
})
