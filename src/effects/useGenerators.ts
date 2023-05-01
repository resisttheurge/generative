import { Generator } from '../lib/generators/Generator'

export interface UseGeneratorsConfig {
  seed: string
  variation?: number
}

export interface UseGeneratorsHandle {
  generate: <T> (generator: Generator<T>) => T
}

export const useGenerators = ({
  seed: seedStr,
  variation = 0
}: UseGeneratorsConfig): UseGeneratorsHandle => {
  let currentState = Generator.initSeed(seedStr)
  for (let v = 0; v < variation; v++) {
    currentState = Generator.hashState(currentState)
  }

  const generate =
    <T> (generator: Generator<T>): T => {
      const [value, nextState] = generator.run(currentState)
      currentState = nextState
      return value
    }

  return {
    generate
  }
}
