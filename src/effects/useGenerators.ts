import { List } from 'immutable'

import { Generator } from '@generators/Generator'
import { xmur3a } from '@hashers/xmur3a'
import { ConcretePRN, PRN, PRNG } from '@prngs/PRNG'
import { JSF32State, JSF32a } from '@prngs/JSF32'

export interface UseGeneratorsConfig <State> {
  prng?: PRNG<State>
  offset?: number
  path?: List<number>
  iteration?: number
}

export interface UseGeneratorsHandle {
  generate: <T> (generator: Generator<T>) => T
}

export function useGenerators (seed: string): UseGeneratorsHandle

export function useGenerators <State> (
  seed: string,
  config: UseGeneratorsConfig<State>
): UseGeneratorsHandle

export function useGenerators (
  seed: string,
  {
    prng = new JSF32a(xmur3a),
    offset = 0,
    path = List(),
    iteration = 0
  }: UseGeneratorsConfig<JSF32State> = {}
): UseGeneratorsHandle {
  let currentState: PRN = new ConcretePRN(prng, seed, offset, path, iteration)

  function generate <T> (generator: Generator<T>): T {
    const [nextState, value] = generator.run(currentState)
    currentState = nextState
    return value
  }

  return {
    generate
  }
}
