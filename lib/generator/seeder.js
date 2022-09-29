/**
 * Seed generator function. Hashes the given string to produce a generator which can generate
 * suitable seed values for PRNGs. Useful if multiple seeded PRNGs are required
 *
 * Adapted xmur3a string hashing algorithm from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
 */
export const seed =
  initString => {
    // convert input string to appropriate seed state
    let state = 2166136261 >>> 0
    for (let k, i = 0; i < initString.length; i++) {
      k = Math.imul(initString.charCodeAt(i), 3432918353)
      k = k << 15 | k >>> 17
      state ^= Math.imul(k, 461845907)
      state = state << 13 | state >>> 19
      state = Math.imul(state, 5) + 3864292196 | 0
    }
    state ^= initString.length
    // repeat the following for more seeds
    state ^= state >>> 16
    state = Math.imul(state, 2246822507)
    state ^= state >>> 13
    state = Math.imul(state, 3266489909)
    state ^= state >>> 16
    return state
  }

export const nextSeed =
  state => {
    state ^= state >>> 16
    state = Math.imul(state, 2246822507)
    state ^= state >>> 13
    state = Math.imul(state, 3266489909)
    state ^= state >>> 16
    return state
  }
