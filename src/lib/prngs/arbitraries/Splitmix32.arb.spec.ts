import { fc, it } from '@fast-check/jest'

import { hasher } from '@hashers/arbitraries'
import * as arb from './Splitmix32.arb'
import * as impl from '@prngs/Splitmix32'

describe('an arbitrary JSF32 implementation', () => {
  it.prop([arb.splitmix32()])(
    'should always be an instance of the canonical implementation',
    jsf32 => {
      expect(jsf32).toBeInstanceOf(impl.Splitmix32)
    }
  )

  it.prop({
    hasher: hasher(fc.integer()),
    seed: fc.string(),
    state: fc.integer()
  })(
    'should allow the caller to provide a concrete or arbitrary hasher',
    ({ hasher, seed, state }) => {
      const concrete = fc.sample(arb.splitmix32({ hasher }), 1)[0]
      expect(concrete.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(concrete.hasher.nextState(state)).toBe(hasher.nextState(state))

      const arbitrary = fc.sample(arb.splitmix32({ hasher: fc.constant(hasher) }), 1)[0]
      expect(arbitrary.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(arbitrary.hasher.nextState(state)).toBe(hasher.nextState(state))
    }
  )

  it.prop({ algorithm: fc.constantFrom(...impl.splitmix32Algorithms) })(
    'should allow the caller to provide a concrete or arbitrary algorithm',
    ({ algorithm }) => {
      const concrete = fc.sample(arb.splitmix32({ algorithm }), 1)[0]
      const arbitrary = fc.sample(arb.splitmix32({ algorithm: fc.constant(algorithm) }), 1)[0]

      if (algorithm === 'splitmix32a') {
        expect(concrete).toBeInstanceOf(impl.Splitmix32a)
        expect(arbitrary).toBeInstanceOf(impl.Splitmix32a)
      } else {
        expect(concrete).toBeInstanceOf(impl.Splitmix32b)
        expect(arbitrary).toBeInstanceOf(impl.Splitmix32b)
      }
    }
  )
})
