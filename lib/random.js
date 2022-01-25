import R from 'ramda'

export const random = Math.random

// https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
export function * mulberry32 (seed) {
  seed |= 0
  do {
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    yield ((t ^ t >>> 14) >>> 0) / 4294967296
  } while (true)
}

// https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
export function * xmur3a (str) {
  let h = 2166136261 >>> 0
  for (let k, i = 0; i < str.length; i++) {
    k = Math.imul(str.charCodeAt(i), 3432918353); k = k << 15 | k >>> 17
    h ^= Math.imul(k, 461845907); h = h << 13 | h >>> 19
    h = Math.imul(h, 5) + 3864292196 | 0
  }
  h ^= str.length
  do {
    h ^= h >>> 16
    h = Math.imul(h, 2246822507)
    h ^= h >>> 13
    h = Math.imul(h, 3266489909)
    h ^= h >>> 16
    yield h >>> 0
  } while (true)
}

export class Random {
  constructor (genFn = x => x) {
    this.genFn = genFn
  }

  * gen (rng) {
    for (const n of rng()) {
      yield this.genFn(n)
    }
  }

  map (f) {
    return new Random(R.compose(f, this.genFn))
  }

  flatMap (f) {
    return new Random()
  }
}

export const genInRange = (min, max) => {
  if (max === undefined) {
    max = min
    min = 0
  }
  return ((random() * (max - min))) + min
}

export const genIntInRange = (min, max) => {
  return Math.round(genInRange(min, max))
}

export const chooseOne = (array) =>
  array && Array.isArray(array) && array.length > 0
    ? array[Math.floor(genInRange(array.length))]
    : undefined

export const genBool = () =>
  !(random() < 0.5)

export const genChoices = (numChoices) => {
  const result = []
  for (let n = 0; n < numChoices; n++) {
    result.push(genBool())
  }
  return result
}
