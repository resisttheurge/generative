import { nextSeed, seed } from '../lib/generator'

export const useGenerators = ({ seed: seedStr, variation = 0 }) => {
  let currentSeed = seed(seedStr)
  for (let v = 0; v < variation; v++) {
    currentSeed = nextSeed(currentSeed)
  }

  const generate = generator => {
    const [value, nextSeed] = generator(currentSeed)
    currentSeed = nextSeed
    return value
  }

  return {
    generate
  }
}
