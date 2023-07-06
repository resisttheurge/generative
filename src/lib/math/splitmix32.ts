/**
   * The uniform distribution generator.
   *
   * splitmix32 prng from:
   * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32
   */
export const next = (state: number): [number, number] => {
  state |= 0 // truncate to 32 bits
  const nextState = (state + 0x9e3779b9) | 0 // 2 to the 32 divided by golden ratio; adding forms a Weyl sequence. Truncating to 32 bits wraps the sequence
  let nextOutput = nextState ^ nextState >>> 16
  nextOutput = Math.imul(nextOutput, 0x21f0aaad)
  nextOutput ^= nextOutput >>> 15
  nextOutput = Math.imul(nextOutput, 0x735a2d97)
  nextOutput ^= nextOutput >>> 15
  return [nextState, (nextOutput >>> 0) / 4294967296]
}
