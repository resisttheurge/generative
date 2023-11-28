import { fc, it } from '@fast-check/jest'

import * as arb from '@prngs/arbitraries'
import {
  ANONYMOUS_PRNG_NAME,
  ConcretePRN,
  STATE_NOT_CALCULABLE,
  VARIATION_NOT_SUPPORTED,
  calculateState
} from './PRNG'
import { List } from 'immutable'
import invariant from 'tiny-invariant'

describe('the display name of an anonymous PRNG', () => {
  it('should be "anonymous-prng"', () => {
    expect(ANONYMOUS_PRNG_NAME).toBe('anonymous-prng')
  })
})

describe('the VARIATION_NOT_SUPPORTED error message function', () => {
  it.prop([fc.option(fc.string(), { nil: undefined })])(
    'should return the expected string when given an optional prng name',
    name => {
      expect(VARIATION_NOT_SUPPORTED(name)).toBe(
        `Variation is not supported: PRNG <${
          name ?? ANONYMOUS_PRNG_NAME
        }> does not define a hashState function`
      )
    }
  )
})

describe('the STATE_NOT_CALCULABLE error message function', () => {
  it.prop([fc.option(fc.string(), { nil: undefined })])(
    'should return the expected string when given an optional prng name',
    name => {
      expect(STATE_NOT_CALCULABLE(name)).toBe(
        `Cannot calculate path because variation is not supported: PRNG <${
          name ?? ANONYMOUS_PRNG_NAME
        }> does not define a hashState function`
      )
    }
  )
})

describe('the calculateState function', () => {
  it.prop({ prng: arb.prng(), seed: fc.string() })(
    "should return the same state as the given PRNG's initState function when given just a seed",
    ({ prng, seed }) => {
      expect(calculateState(prng, seed)).toBe(prng.initState(seed))
    }
  )

  it.prop({
    prng: arb.prng(fc.anything(), { noHashState: true }),
    seed: fc.string(),
    path: fc.array(fc.nat(100), { size: 'small' }).map(List),
    iteration: fc.nat(100)
  })(
    'should throw an error when given a PRNG that does not define a hashState function and a non-empty path',
    ({ prng, seed, path, iteration }) => {
      if (path.isEmpty()) {
        expect(() => calculateState(prng, seed, path, iteration))
          .not.toThrow()
      } else {
        expect(() => calculateState(prng, seed, path, iteration))
          .toThrowError(STATE_NOT_CALCULABLE(prng.name))
      }
    }
  )

  it.prop({
    prng: arb.prng(fc.anything(), { noHashState: false }),
    seed: fc.string(),
    path: fc.array(fc.nat(100), { size: 'small' }).map(List),
    iteration: fc.nat(100)
  })(
    "pushing the given iteration onto the given path should return the same state as calling the given PRNGs's hashState function on the previous state",
    ({ prng, seed, path, iteration }) => {
      invariant(prng.hashState !== undefined, () => VARIATION_NOT_SUPPORTED(prng.name))
      expect(calculateState(prng, seed, path.push(iteration)))
        .toBe(prng.hashState(calculateState(prng, seed, path, iteration)))
    }
  )

  it.prop({
    prng: arb.prng(fc.anything(), { noHashState: false }),
    seed: fc.string(),
    path: fc.array(fc.nat(100), { size: 'small' }).map(List),
    iteration: fc.nat(100)
  })(
    "incrementing the given iteration should return the same state as calling the given PRNG's nextState function on the previous state",
    ({ prng, seed, path, iteration }) => {
      expect(calculateState(prng, seed, path, iteration + 1))
        .toBe(prng.nextState(calculateState(prng, seed, path, iteration)))
    }
  )
})

describe('the ConcretePRN class', () => {
  it.prop({
    prng: arb.prng(fc.anything(), { noHashState: false }),
    seed: fc.string(),
    path: fc.option(
      fc.array(fc.nat(100), { size: 'small' }).map(List),
      { nil: undefined }
    ),
    iteration: fc.option(fc.nat(100), { nil: undefined }),
    state: fc.option(fc.anything(), { nil: undefined })
  })(
    'should be constructable with a PRNG, a seed, and an optional path, iteration, and state',
    ({ prng, seed, path, iteration, state }) => {
      const prn = new ConcretePRN(prng, seed, path, iteration, state)
      expect(prn).toBeInstanceOf(ConcretePRN)
      expect(prn.prng).toBe(prng)
      expect(prn.seed).toBe(seed)
      expect(prn.path).toBe(path ?? List())
      expect(prn.iteration).toBe(iteration ?? 0)
      expect(prn.state).toBe(
        state !== undefined
          ? state
          : calculateState(prng, seed, path, iteration)
      )
    }
  )

  it.prop([arb.prn()])(
    'should return the same value as the given PRNGs extractValue function called on its state when accessing the value property',
    prn => {
      expect(prn.value).toBe(prn.prng.extractValue(prn.state))
    }
  )

  it.prop([arb.prn()])(
    'should return the same normalized value as the given PRNGs extractValue function called on its state when accessing the normalized property',
    prn => {
      expect(prn.normalized).toBe(
        (prn.value - prn.prng.min) /
        (prn.prng.max - prn.prng.min)
      )
    }
  )

  it.prop([arb.prn()])(
    'should return the expected string representation when calling toString',
    prn => {
      expect(prn.toString()).toBe(
        `<${
          prn.prng.name ?? ANONYMOUS_PRNG_NAME
        }@${
          prn.seed
        }:${
          prn.path.push(prn.iteration)
            .join(':')
        }=${
          prn.prng.formatState?.(prn.state) ??
          JSON.stringify(prn.state)
        }->${
          prn.value
        }|${
          prn.normalized
        }>`
      )
    }
  )
})
