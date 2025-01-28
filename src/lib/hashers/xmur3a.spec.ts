import { fc, it } from '@fast-check/jest'

import * as arb from '@hashers/arbitraries'

/**
 * The maximum number of hash states to be generated when testing
 * for cycles, i.e. visiting the same hash state more than once.
 * Chosen to be small enough to ensure that the tests run quickly,
 * but large enough to ensure that the tests are meaningful.
 */
const CYCLE_LIMIT = 10_000

describe('the xmur3a hasher', () => {
  it.prop({ xmur3a: arb.xmur3a(), seed: fc.string() })(
    'should always return the same initial state for the same seed',
    ({ xmur3a, seed }) => {
      expect(xmur3a.initState(seed)).toBe(xmur3a.initState(seed))
    },
  )

  it.prop({ xmur3a: arb.xmur3a(), seed1: fc.string(), seed2: fc.string() })(
    'should always return different initial states for different seeds',
    ({ xmur3a, seed1, seed2 }) => {
      fc.pre(seed1 !== seed2)
      expect(xmur3a.initState(seed1)).not.toBe(xmur3a.initState(seed2))
    },
  )

  it.prop({ xmur3a: arb.xmur3a(), state: fc.integer() })(
    'should always return the same next state for the same given state',
    ({ xmur3a, state }) => {
      expect(xmur3a.nextState(state)).toBe(xmur3a.nextState(state))
    },
  )

  it.prop({ xmur3a: arb.xmur3a(), state1: fc.integer(), state2: fc.integer() })(
    'should always return different next states for different given states',
    ({ xmur3a, state1, state2 }) => {
      fc.pre(state1 !== state2)
      expect(xmur3a.nextState(state1)).not.toBe(xmur3a.nextState(state2))
    },
  )

  it.prop({
    xmur3a: arb.xmur3a(),
    seed: fc.string(),
    count: fc.nat({ max: CYCLE_LIMIT }),
  })(
    'should not return the same state more than once for a given seed',
    ({ xmur3a, seed, count }) => {
      let currentState = xmur3a.initState(seed)
      const states = new Set<number>()
      for (let i = 0; i < count; i++) {
        states.add(currentState)
        currentState = xmur3a.nextState(currentState)
      }
      expect(states.size).toBe(count)
    },
  )
})
