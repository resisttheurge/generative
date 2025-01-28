import { fc, it } from '@fast-check/jest'
import { equals } from 'ramda'

import { mulberry32 } from './arbitraries'

describe('Mulberry32', () => {
  it.prop([mulberry32()])('should implement the PRNG interface', prng => {
    expect(prng).toHaveProperty('name')
    expect(prng.name).toBe('mulberry32')

    expect(prng).toHaveProperty('min')
    expect(prng.min).toBe(0x0)

    expect(prng).toHaveProperty('max')
    expect(prng.max).toBe(0x100000000)

    expect(prng).toHaveProperty('initState')
    expect(prng.initState).toBeInstanceOf(Function)

    expect(prng).toHaveProperty('nextState')
    expect(prng.nextState).toBeInstanceOf(Function)

    expect(prng).toHaveProperty('hashState')
    expect(prng.hashState).toBeInstanceOf(Function)

    expect(prng).not.toHaveProperty('formatState')

    expect(prng).toHaveProperty('extractValue')
    expect(prng.extractValue).toBeInstanceOf(Function)
  })

  it.prop({ prng: mulberry32(), seed: fc.string() })(
    'should initialize to the same state given the same seed',
    ({ prng, seed }) => {
      expect(prng.initState(seed)).toEqual(prng.initState(seed))
    },
  )

  it.prop({ prng: mulberry32(), seed1: fc.string(), seed2: fc.string() })(
    'should initialize to different states given different seeds',
    ({ prng, seed1, seed2 }) => {
      fc.pre(seed1 !== seed2)
      expect(prng.initState(seed1)).not.toEqual(prng.initState(seed2))
    },
  )

  it.prop({ prng: mulberry32(), state: fc.integer() })(
    'should produce the same next state given the same current state',
    ({ prng, state }) => {
      expect(prng.nextState(state)).toEqual(prng.nextState(state))
    },
  )

  it.prop({ prng: mulberry32(), state1: fc.integer(), state2: fc.integer() })(
    'should produce different next states given different current states',
    ({ prng, state1, state2 }) => {
      fc.pre(!equals(state1, state2))
      expect(prng.nextState(state1)).not.toEqual(prng.nextState(state2))
    },
  )

  it.prop({ prng: mulberry32(), state: fc.integer() })(
    'should produce the same hashed state given the same current state',
    ({ prng, state }) => {
      expect(prng.hashState(state)).toEqual(prng.hashState(state))
    },
  )

  it.prop({ prng: mulberry32(), state1: fc.integer(), state2: fc.integer() })(
    'should produce different hashed states given different current states',
    ({ prng, state1, state2 }) => {
      fc.pre(state1 !== state2)
      expect(prng.hashState(state1)).not.toEqual(prng.hashState(state2))
    },
  )

  it.prop({ prng: mulberry32(), state: fc.integer() })(
    'should produce a value in the correct range',
    ({ prng, state }) => {
      const value = prng.extractValue(state)
      expect(value).toBeGreaterThanOrEqual(prng.min)
      expect(value).toBeLessThanOrEqual(prng.max)
    },
  )

  it.prop({ prng: mulberry32(), state: fc.integer() })(
    'should produce the same value given the same state',
    ({ prng, state }) => {
      expect(prng.extractValue(state)).toEqual(prng.extractValue(state))
    },
  )

  it.prop({ prng: mulberry32(), state1: fc.integer(), state2: fc.integer() })(
    'should produce different values given different states',
    ({ prng, state1, state2 }) => {
      fc.pre(!equals(state1, state2))
      expect(prng.extractValue(state1)).not.toEqual(prng.extractValue(state2))
    },
  )
})
