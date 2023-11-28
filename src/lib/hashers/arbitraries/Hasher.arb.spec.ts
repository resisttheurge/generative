import { fc, it } from '@fast-check/jest'

import * as arb from './Hasher.arb'

describe('an arbitrary hasher', () => {
  it.prop([arb.hasher()])(
    'should match the Hasher interface',
    hasher => {
      expect(
        hasher.name === undefined ||
        typeof hasher.name === 'string'
      ).toBe(true)

      expect(hasher).toHaveProperty('initState')
      expect(hasher.initState).toBeInstanceOf(Function)

      expect(hasher).toHaveProperty('nextState')
      expect(hasher.nextState).toBeInstanceOf(Function)
    }
  )

  it.prop({ hasher: arb.hasher(), seed: fc.string() })(
    'should always return the same initial state for the same given seed',
    ({ hasher, seed }) => {
      expect(hasher.initState(seed)).toBe(hasher.initState(seed))
    }
  )

  it.prop({ hasher: arb.hasher(), state: fc.anything() })(
    'should always return the same next state for the same given state',
    ({ hasher, state }) => {
      expect(hasher.nextState(state)).toBe(hasher.nextState(state))
    }
  )

  it.prop({ name: fc.string() })(
    'should allow the caller to provide a concrete or arbitrary name',
    ({ name }) => {
      const concrete = fc.sample(arb.hasher(undefined, { name }), 1)[0]
      expect(concrete.name).toBe(name)

      const arbitrary = fc.sample(arb.hasher(undefined, { name: fc.constant(name) }), 1)[0]
      expect(arbitrary.name).toBe(name)
    }
  )

  it.prop({ arbState: fc.anything(), seed: fc.string(), state: fc.anything() })(
    'should allow the caller to provide an arbitrary state to be used by the initState and nextState functions ',
    ({ arbState, seed, state }) => {
      const hasher = fc.sample(arb.hasher(fc.constant(arbState)), 1)[0]
      expect(hasher.initState(seed)).toBe(arbState)
      expect(hasher.nextState(state)).toBe(arbState)
    }
  )
})
