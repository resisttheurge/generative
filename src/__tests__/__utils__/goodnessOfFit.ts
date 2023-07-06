import jstat from 'jstat'

export function goodnessOfFit (observed: number[], expected: number[], ddof: number = 0): { value: number, pValue: number } {
  const chi2 = observed.reduce(
    (sum, obs, i) => sum + (obs - expected[i]) ** 2 / expected[i],
    0
  )
  const p = 1 - jstat.chisquare.cdf(chi2, observed.length - 1 - ddof)
  return {
    value: chi2,
    pValue: p
  }
}
