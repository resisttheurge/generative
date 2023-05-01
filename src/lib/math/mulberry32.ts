/**
   * The uniform distribution generator.
   *
   * mulberry32 prng from:
   * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
   */
export const nextState = (state: number): [number, number] => {
  const nextState = state + 0x6D2B79F5 | 0
  let t = Math.imul(nextState ^ nextState >>> 15, 1 | nextState)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  const nextValue = ((t ^ t >>> 14) >>> 0) / 4294967296
  return [nextValue, nextState]
}
