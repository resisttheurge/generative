import { fc, it } from '@fast-check/jest'

import { hasher } from '@hashers/arbitraries'
import * as arb from './JSF32.arb'
import * as impl from '@prngs/JSF32'

describe('an arbitrary JSF32 implementation', () => {
  it.prop([arb.jsf32()])(
    'should always be an instance of the canonical implementation',
    jsf32 => {
      expect(jsf32).toBeInstanceOf(impl.JSF32)
    },
  )

  it.prop({
    hasher: hasher(fc.integer()),
    seed: fc.string(),
    state: fc.integer(),
  })(
    'should allow the caller to provide a concrete or arbitrary hasher',
    ({ hasher, seed, state }) => {
      const concrete = fc.sample(arb.jsf32({ hasher }), 1)[0]
      expect(concrete.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(concrete.hasher.nextState(state)).toBe(hasher.nextState(state))

      const arbitrary = fc.sample(
        arb.jsf32({ hasher: fc.constant(hasher) }),
        1,
      )[0]
      expect(arbitrary.hasher.initState(seed)).toBe(hasher.initState(seed))
      expect(arbitrary.hasher.nextState(state)).toBe(hasher.nextState(state))
    },
  )

  it.prop({ algorithm: fc.constantFrom(...impl.jsf32Algorithms) })(
    'should allow the caller to provide a concrete or arbitrary algorithm',
    ({ algorithm }) => {
      const concrete = fc.sample(arb.jsf32({ algorithm }), 1)[0]
      const arbitrary = fc.sample(
        arb.jsf32({ algorithm: fc.constant(algorithm) }),
        1,
      )[0]

      if (algorithm === 'jsf32a') {
        expect(concrete).toBeInstanceOf(impl.JSF32a)
        expect(arbitrary).toBeInstanceOf(impl.JSF32a)
      } else {
        expect(concrete).toBeInstanceOf(impl.JSF32b)
        expect(arbitrary).toBeInstanceOf(impl.JSF32b)
      }
    },
  )
})

describe('an arbitrary JSF32 state', () => {
  it.prop([arb.jsf32State()])('should be an array of four numbers', state => {
    expect(state).toBeInstanceOf(Array)
    expect(state).toHaveLength(4)
    for (const block of state) {
      expect(typeof block).toBe('number')
    }
  })
})
