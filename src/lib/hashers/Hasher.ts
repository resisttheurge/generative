import invariant from 'tiny-invariant'

import { SizedTuple } from '@data-structures/sized-tuples'

export function NEGATIVE_COUNT_ERROR (count: number): string {
  return `Count must be a non-negative number. Received: ${count}`
}

export function MAX_ARRAY_LENGTH_ERROR (count: number): string {
  return `Count must be a less than max array length. Received: ${count}`
}

/**
 * Interface for a hash function suitable for seeding and hashing
 * the state of a PRNG.
 *
 * @template State - the internal state operated on by the hash function
 */
export interface Hasher<State> {
  readonly name?: string
  readonly initState: (seed: string) => State
  readonly nextState: (state: State) => State
}

export function hashStates <State, N extends number> (
  hasher: Hasher<State>,
  currentState: State,
  count: N
): SizedTuple<State, N> {
  invariant(count >= 0, () => NEGATIVE_COUNT_ERROR(count))
  invariant(count <= 0xFFFFFFFE, () => MAX_ARRAY_LENGTH_ERROR(count))
  const result = [] as SizedTuple<State, N>
  while (count-- > 0) {
    result.push(currentState)
    currentState = hasher.nextState(currentState)
  }
  return result
}

export function initStates <State, N extends number> (
  hasher: Hasher<State>,
  seed: string,
  count: N
): SizedTuple<State, N> {
  invariant(count >= 0, () => NEGATIVE_COUNT_ERROR(count))
  invariant(count <= 0xFFFFFFFE, () => MAX_ARRAY_LENGTH_ERROR(count))
  const initialState = hasher.initState(seed)
  return hashStates(hasher, initialState, count)
}
