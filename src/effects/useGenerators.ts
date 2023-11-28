import { ConcretePRN, PRN, PRNG } from '@prngs/PRNG'
import { Generator } from '../lib/generators/Generator'
import { List } from 'immutable'
import { JSF32State, JSF32a } from '@prngs/JSF32'
import { xmur3a } from '@hashers/xmur3a'

export interface UseGeneratorsConfig <State> {
  prng?: PRNG<State>
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
    path = List(),
    iteration = 0
  }: UseGeneratorsConfig<JSF32State> = {}
): UseGeneratorsHandle {
  let currentState: PRN = new ConcretePRN(prng, seed, path, iteration)

  function generate <T> (generator: Generator<T>): T {
    const [nextState, value] = generator.run(currentState)
    currentState = nextState
    return value
  }

  return {
    generate
  }
}
