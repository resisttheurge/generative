/**
 * Seed generator function. Hashes the given string to produce a generator which can generate
 * suitable seed values for PRNGs. Useful if multiple seeded PRNGs are required
 *
 * Adapted xmur3a string hashing algorithm from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
 *
 * @param initString - string to seed the generator with
 * @returns an initial seed state based on the given string
 */
export const hashString =
  (initString: string): number => {
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

/**
 * Takes the current seed state and hashes it according to the "repeated seed" portion of the xmur3a string hashing algorithm from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
 *
 * Useful for seeding multiple PRNGs from a single origin seed state. Used by the `Generator.sequence` function to isolate the seed
 * state for each generator in a sequence
 *
 * @param state - current seed state
 * @returns the hashed seed state
 */
export const hashState =
  (state: number): number => {
    state ^= state >>> 16
    state = Math.imul(state, 2246822507)
    state ^= state >>> 13
    state = Math.imul(state, 3266489909)
    state ^= state >>> 16
    return state
  }
