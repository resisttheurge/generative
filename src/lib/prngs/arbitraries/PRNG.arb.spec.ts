import { fc, it } from '@fast-check/jest'

import * as arb from './PRNG.arb'
import { isList } from 'immutable'
import { PRN, calculateState } from '@prngs/PRNG'

describe('an arbitrary PRNG', () => {
  it.prop([arb.prng()])(
    'should match the PRNG interface',
    prng => {
      expect(prng).toHaveProperty('name')
      if (prng.name !== undefined) {
        expect(typeof prng.name).toBe('string')
      }

      expect(prng).toHaveProperty('min')
      expect(typeof prng.min).toBe('number')

      expect(prng).toHaveProperty('max')
      expect(typeof prng.max).toBe('number')

      expect(prng).toHaveProperty('initState')
      expect(prng.initState).toBeInstanceOf(Function)

      expect(prng).toHaveProperty('nextState')
      expect(prng.nextState).toBeInstanceOf(Function)

      expect(prng).toHaveProperty('hashState')
      if (prng.hashState !== undefined) {
        expect(prng.hashState).toBeInstanceOf(Function)
      }

      expect(prng).toHaveProperty('formatState')
      if (prng.formatState !== undefined) {
        expect(prng.formatState).toBeInstanceOf(Function)
      }

      expect(prng).toHaveProperty('extractValue')
      expect(prng.extractValue).toBeInstanceOf(Function)
    }
  )

  it.prop([arb.prng()])(
    'should have a valid range',
    prng => {
      expect(prng.min).toBeLessThan(prng.max)
    }
  )

  it.prop({ prng: arb.prng(), seed: fc.string() })(
    'should always initialize to the same state given the same seed',
    ({ prng, seed }) => {
      expect(prng.initState(seed)).toEqual(prng.initState(seed))
    }
  )

  it.prop({ prng: arb.prng(), state: fc.anything() })(
    'should always produce the same next state given the same current state',
    ({ prng, state }) => {
      expect(prng.nextState(state)).toEqual(prng.nextState(state))
    }
  )

  it.prop({
    prng: arb.prng(undefined, { noHashState: false }),
    state: fc.anything()
  })(
    'should always produce the same hashed state given the same current state',
    ({ prng, state }) => {
      if (prng.hashState !== undefined) {
        expect(prng.hashState(state)).toEqual(prng.hashState(state))
      }
    }
  )

  it.prop({
    prng: arb.prng(undefined, { noFormatState: false }),
    state: fc.anything()
  })(
    'should always produce the same formatted state given the same current state',
    ({ prng, state }) => {
      if (prng.formatState !== undefined) {
        expect(prng.formatState(state)).toEqual(prng.formatState(state))
      }
    }
  )

  it.prop({ prng: arb.prng(), state: fc.anything() })(
    'should always extract the same value given the same current state',
    ({ prng, state }) => {
      expect(prng.extractValue(state)).toEqual(prng.extractValue(state))
    }
  )

  it.prop({ prng: arb.prng(), state: fc.anything() })(
    "should always extract a value within the PRNG's range",
    ({ prng, state }) => {
      const value = prng.extractValue(state)
      expect(value).toBeGreaterThanOrEqual(prng.min)
      expect(value).toBeLessThanOrEqual(prng.max)
    }
  )

  it.prop([fc.string()])(
    'should allow the caller to provide a concrete or arbitrary name',
    name => {
      const concrete = fc.sample(arb.prng(undefined, { name }), 1)[0]
      expect(concrete.name).toBe(name)

      const arbitrary = fc.sample(arb.prng(undefined, { name: fc.constant(name) }), 1)[0]
      expect(arbitrary.name).toBe(name)
    }
  )

  it.prop({
    range: fc.integer({
      max: 0x7FFFFFFE
    }).chain(min => fc.integer({
      min: min + 1
    }).map(max => [min, max])),
    state: fc.anything()
  })(
    'should allow the caller to provide a concrete or arbitrary range',
    ({ range: [min, max], state }) => {
      const concrete = fc.sample(arb.prng(undefined, { range: [min, max] }), 1)[0]
      expect(concrete.min).toBe(min)
      expect(concrete.extractValue(state)).toBeGreaterThanOrEqual(min)
      expect(concrete.max).toBe(max)
      expect(concrete.extractValue(state)).toBeLessThanOrEqual(max)

      const arbitrary = fc.sample(arb.prng(undefined, { range: fc.constant([min, max]) }), 1)[0]
      expect(arbitrary.min).toBe(min)
      expect(arbitrary.extractValue(state)).toBeGreaterThanOrEqual(min)
      expect(arbitrary.max).toBe(max)
      expect(arbitrary.extractValue(state)).toBeLessThanOrEqual(max)
    }
  )

  it.prop([fc.boolean()])(
    'should allow the caller to flag whether or not the PRNG has a hashState function',
    noHashState => {
      const concrete = fc.sample(arb.prng(undefined, { noHashState }), 1)[0]
      const arbitrary = fc.sample(arb.prng(undefined, { noHashState: fc.constant(noHashState) }), 1)[0]

      if (noHashState) {
        expect(concrete.hashState).toBeUndefined()
        expect(arbitrary.hashState).toBeUndefined()
      } else {
        expect(concrete.hashState).toBeInstanceOf(Function)
        expect(arbitrary.hashState).toBeInstanceOf(Function)
      }
    }
  )

  it.prop([fc.boolean()])(
    'should allow the caller to flag whether or not the PRNG has a formatState function',
    noFormatState => {
      const concrete = fc.sample(arb.prng(undefined, { noFormatState }), 1)[0]
      const arbitrary = fc.sample(arb.prng(undefined, { noFormatState: fc.constant(noFormatState) }), 1)[0]

      if (noFormatState) {
        expect(concrete.formatState).toBeUndefined()
        expect(arbitrary.formatState).toBeUndefined()
      } else {
        expect(concrete.formatState).toBeInstanceOf(Function)
        expect(arbitrary.formatState).toBeInstanceOf(Function)
      }
    }
  )
})

describe('an arbitrary PRN', () => {
  it.prop([arb.prn()])(
    'should match the PRN interface',
    prn => {
      expect(prn).toHaveProperty('prng')

      expect(prn).toHaveProperty('seed')
      expect(typeof prn.seed).toBe('string')

      expect(prn).toHaveProperty('path')
      expect(isList(prn.path)).toBeTrue()

      expect(prn).toHaveProperty('iteration')
      expect(typeof prn.iteration).toBe('number')

      expect(prn).toHaveProperty('state')

      expect(prn).toHaveProperty('value')
      expect(prn.value).toBeGreaterThanOrEqual(prn.prng.min)
      expect(prn.value).toBeLessThanOrEqual(prn.prng.max)

      expect(prn).toHaveProperty('normalized')
      expect(prn.normalized).toBeGreaterThanOrEqual(0)
      expect(prn.normalized).toBeLessThanOrEqual(1)

      expect(prn).toHaveProperty('next')
      expect(prn.next).toBeInstanceOf(PRN)

      if (prn.prng.hashState !== undefined) {
        expect(prn).toHaveProperty('variation')
        expect(prn.variation).toBeInstanceOf(PRN)
      }
    }
  )

  it.prop([arb.prng()])(
    'should allow the caller to provide an arbitrary PRNG',
    prng => {
      const prn = fc.sample(arb.prn(fc.constant(prng)), 1)[0]
      expect(prn.state)
        .toEqual(calculateState(
          prng,
          prn.seed,
          prn.path,
          prn.iteration
        ))
    }
  )

  it.prop([fc.string()])(
    'should allow the caller to provide a concrete or arbitrary seed',
    seed => {
      const concrete = fc.sample(arb.prn(arb.prng(), { seed }), 1)[0]
      expect(concrete.seed).toBe(seed)

      const arbitrary = fc.sample(arb.prn(arb.prng(), { seed: fc.constant(seed) }), 1)[0]
      expect(arbitrary.seed).toBe(seed)
    }
  )

  it.prop([fc.nat(1000)])(
    'should allow the caller to provide a concrete or arbitrary iteration',
    iteration => {
      const concrete = fc.sample(arb.prn(arb.prng(), { iteration }), 1)[0]
      expect(concrete.iteration).toBe(iteration)

      const arbitrary = fc.sample(arb.prn(arb.prng(), { iteration: fc.constant(iteration) }), 1)[0]
      expect(arbitrary.iteration).toBe(iteration)
    }
  )

  it.prop([fc.boolean()])(
    'should allow the caller to flag that the PRN has no path',
    noPath => {
      const concrete = fc.sample(arb.prn(
        arb.prng(),
        { noPath }
      ), 1)[0]

      const arbitrary = fc.sample(arb.prn(
        arb.prng(),
        { noPath: fc.constant(noPath) }
      ), 1)[0]

      if (noPath) {
        expect(concrete.path.isEmpty()).toBeTrue()
        expect(arbitrary.path.isEmpty()).toBeTrue()
      }
    }
  )

  it.prop([fc.nat(1000)])(
    'should allow the caller to provide a concrete or arbitrary maxPathIterations',
    maxPathIterations => {
      const concrete = fc.sample(arb.prn(
        arb.prng(),
        { maxPathIterations }
      ), 1)[0]

      const arbitrary = fc.sample(arb.prn(
        arb.prng(),
        { maxPathIterations: fc.constant(maxPathIterations) }
      ), 1)[0]

      for (const segment of concrete.path) {
        expect(segment).toBeLessThanOrEqual(maxPathIterations)
      }

      for (const segment of arbitrary.path) {
        expect(segment).toBeLessThanOrEqual(maxPathIterations)
      }
    }
  )

  it.prop([fc.constantFrom<fc.Size>('xsmall', 'small', 'medium', 'large', 'xlarge')])(
    'should allow the caller to provide a concrete or arbitrary pathSize',
    pathSize => {
      const concrete = fc.sample(arb.prn(
        arb.prng(),
        { pathSize, maxPathIterations: 1 }
      ), 1)[0]

      const arbitrary = fc.sample(arb.prn(
        arb.prng(),
        {
          pathSize: fc.constant(pathSize),
          maxPathIterations: 1
        }
      ), 1)[0]

      if (pathSize === 'xsmall') {
        expect(concrete.path.size).toBeLessThanOrEqual(1)
        expect(arbitrary.path.size).toBeLessThanOrEqual(1)
      } else if (pathSize === 'small') {
        expect(concrete.path.size).toBeLessThanOrEqual(10)
        expect(arbitrary.path.size).toBeLessThanOrEqual(10)
      } else if (pathSize === 'medium') {
        expect(concrete.path.size).toBeLessThanOrEqual(100)
        expect(arbitrary.path.size).toBeLessThanOrEqual(100)
      } else if (pathSize === 'large') {
        expect(concrete.path.size).toBeLessThanOrEqual(1000)
        expect(arbitrary.path.size).toBeLessThanOrEqual(1000)
      } else {
        expect(concrete.path.size).toBeLessThanOrEqual(10000)
        expect(arbitrary.path.size).toBeLessThanOrEqual(10000)
      }
    }
  )
})
