import { List } from 'immutable'
import invariant from 'tiny-invariant'

export const ANONYMOUS_PRNG_NAME = 'anonymous-prng'

export function VARIATION_NOT_SUPPORTED(name?: string): string {
  return `Variation is not supported: PRNG <${
    name ?? ANONYMOUS_PRNG_NAME
  }> does not define a hashState function`
}

export function STATE_NOT_CALCULABLE(name: string | undefined): string {
  return `Cannot calculate path because variation is not supported: PRNG <${
    name ?? ANONYMOUS_PRNG_NAME
  }> does not define a hashState function`
}

/**
 * Interface that describes a pseudo-random number generator.
 *
 * Used as a configuration object for the PRN class, it defines
 * the range of the associated pseudo-random number generator,
 * how to initialize the generator from a seed, how to advance
 * the generator to the next state, and how to extract a value
 * from the generator's current state.
 *
 * Optionally, it can also define a function to hash the current
 * state, and a function to format the current state as a string.
 * The former is used to provide "variations" on a generated value,
 * while the latter, along with the optional name property, is used
 * when generating a string representation of a PRN.
 *
 * @template State - the internal state of the PRNG
 */
export interface PRNG<State> {
  /**
   * Optional name for the PRNG.
   *
   * Useful for debugging, logging, and testing with multiple PRNG
   * definitions
   */
  readonly name?: string

  /**
   * Lower bound (inclusive) of values that can be extracted from
   * the PRNG by {@link PRNG.extractValue()}
   *
   * Useful when normalizing or otherwise scaling values generated
   * by this PRNG
   *
   * @see {@link PRNG.max}
   * @see {@link PRN.normalized}
   */
  readonly min: number

  /**
   * Upper bound (exclusive) of values that can be extracted from
   * the PRNG by {@link PRNG.extractValue()}
   *
   * Useful when normalizing or otherwise scaling values generated
   * by this PRNG
   *
   * @see {@link PRNG.min}
   * @see {@link PRN.normalized}
   */
  readonly max: number

  /**
   * Generates an initial PRNG state from a given seed string.
   *
   * @param seed the seed string to initialize the PRNG state from
   * @returns the initial state of the PRNG
   */
  readonly initState: (seed: string) => State

  /**
   * Advances a given PRNG state.
   *
   * @param state a PRNG state to advance
   * @returns the next state of the PRNG
   */
  readonly nextState: (state: State) => State

  /**
   * Optional function that hashes a given PRNG state to produce a
   * new state.
   *
   * Useful for generating "variations" on a given PRNG state.
   *
   * @param state a PRNG state to hash
   * @returns the hashed PRNG state
   */
  readonly hashState?: (state: State) => State

  /**
   * Formats a given PRNG state as a string.
   *
   * @param state a PRNG state to format
   * @returns a string representation of the PRNG state
   *
   * @see {@link PRN.toString()}
   */
  readonly formatState?: (state: State) => string

  /**
   * Extracts a numeric value from a given PRNG state.
   * The extracted value must be in the (inclusive) range
   * defined by the PRNG's {@link PRNG.min} and
   * {@link PRNG.max} properties.
   *
   * @param state a PRNG state to extract a value from
   * @returns a value extracted from the PRNG state
   *
   * @see {@link PRN.value}
   */
  readonly extractValue: (state: State) => number
}

/**
 * Given a PRNG, a seed, a variation path, and an iteration count, calculates
 * the PRNG's current state.
 *
 * @template State - the internal state of the PRNG
 * @param prng
 * @param seed
 * @param path
 * @param iteration
 * @returns
 */
export function calculateState<State>(
  prng: PRNG<State>,
  seed: string,
  offset: number = 0,
  path: List<number> = List(),
  iteration: number = 0,
): State {
  let state = prng.initState(seed)
  if (offset > 0 || path.size > 0) {
    invariant(prng.hashState !== undefined, () =>
      STATE_NOT_CALCULABLE(prng.name),
    )
    while (offset-- > 0) {
      state = prng.hashState(state)
    }
    for (let segment of path) {
      while (segment-- > 0) {
        state = prng.nextState(state)
      }
      state = prng.hashState(state)
    }
  }
  while (iteration-- > 0) {
    state = prng.nextState(state)
  }
  return state
}

export interface PRN {
  readonly seed: string
  readonly offset: number
  readonly path: List<number>
  readonly iteration: number
  readonly value: number
  readonly normalized: number
  readonly next: PRN
  readonly variation?: PRN
}

export class ConcretePRN<State> implements PRN {
  private _value?: number
  private _normalized?: number

  constructor(
    readonly prng: PRNG<State>,
    readonly seed: string,
    readonly offset: number = 0,
    readonly path: List<number> = List(),
    readonly iteration: number = 0,
    readonly state: State = calculateState(prng, seed, offset, path, iteration),
  ) {}

  get value(): number {
    if (this._value === undefined) {
      this._value = this.prng.extractValue(this.state)
    }
    return this._value
  }

  get normalized(): number {
    if (this._normalized === undefined) {
      this._normalized =
        (this.value - this.prng.min) / (this.prng.max - this.prng.min)
    }
    return this._normalized
  }

  get next(): ConcretePRN<State> {
    return new ConcretePRN(
      this.prng,
      this.seed,
      this.offset,
      this.path,
      this.iteration + 1,
      this.prng.nextState(this.state),
    )
  }

  get variation(): ConcretePRN<State> | undefined {
    if (this.prng.hashState === undefined) {
      return undefined
    } else {
      return new ConcretePRN(
        this.prng,
        this.seed,
        this.offset,
        this.path.push(this.iteration),
        0,
        this.prng.hashState(this.state),
      )
    }
  }

  /**
   *
   * @returns a string representation of the PRN
   */
  toString(): string {
    return `<${this.prng.name ?? ANONYMOUS_PRNG_NAME}@${this.seed}^${
      this.offset
    }:${
      this.path.size > 0
        ? `${this.path.join(':')}:${this.iteration}`
        : this.iteration
    }=${this.prng.formatState?.(this.state) ?? JSON.stringify(this.state)}->${
      this.value
    }|${this.normalized}>`
  }
}
