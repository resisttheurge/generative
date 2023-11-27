import { fc, it } from '@fast-check/jest'

import { hasher } from '@hashers/arbitraries'
import * as impl from '@prngs/SFC32'
import * as arb from './SFC32.arb'

describe('an arbitrary JSF32 implementation', () => {
  it.prop([arb.sfc32()])(
    'should always be an instance of the canonical implementation',
    sfc32 => {
      expect(sfc32).toBeInstanceOf(impl.SFC32)
    }
  )

  it.prop({
    hasher: hasher(fc.integer()),
    seed: fc.string(),
    state: fc.integer()
  })(
    'should allow the caller to provide a concrete or arbitrary hasher',
    ({ hasher, seed, state }) => {
      const concrete = fc.sample(arb.sfc32({ hasher }), 1)[0]
      expect(concrete.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(concrete.hasher.nextState(state)).toBe(hasher.nextState(state))

      const arbitrary = fc.sample(arb.sfc32({ hasher: fc.constant(hasher) }), 1)[0]
      expect(arbitrary.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(arbitrary.hasher.nextState(state)).toBe(hasher.nextState(state))
    }
  )

  it.prop({ algorithm: fc.constantFrom(...impl.sfc32Algorithms) })(
    'should allow the caller to provide a concrete or arbitrary algorithm',
    ({ algorithm }) => {
      const concrete = fc.sample(arb.sfc32({ algorithm }), 1)[0]
      const arbitrary = fc.sample(arb.sfc32({ algorithm: fc.constant(algorithm) }), 1)[0]

      if (algorithm === 'sfc32a') {
        expect(concrete).toBeInstanceOf(impl.SFC32a)
        expect(arbitrary).toBeInstanceOf(impl.SFC32a)
      } else if (algorithm === 'sfc32b') {
        expect(concrete).toBeInstanceOf(impl.SFC32b)
        expect(arbitrary).toBeInstanceOf(impl.SFC32b)
      } else {
        expect(concrete).toBeInstanceOf(impl.SFC32c)
        expect(arbitrary).toBeInstanceOf(impl.SFC32c)
      }
    }
  )
})

describe('an arbitrary SFC32 state', () => {
  it.prop([arb.sfc32State()])(
    'should be an array of four numbers',
    state => {
      expect(state).toBeInstanceOf(Array)
      expect(state).toHaveLength(4)
      for (const block of state) {
        expect(typeof block).toBe('number')
      }
    }
  )
})
