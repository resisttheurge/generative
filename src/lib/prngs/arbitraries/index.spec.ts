import * as arbs from './index'
import * as JSF32Arbs from './JSF32.arb'
import * as Mulberry32Arbs from './Mulberry32.arb'
import * as PRNGArbs from './PRNG.arb'
import * as SFC32Arbs from './SFC32.arb'
import * as Splitmix32Arbs from './Splitmix32.arb'

describe('the @prngs/arbitraries index file', () => {
  it('should contain all entries from the JSF32.arb.ts, Mulberry32.arb.ts, PRNG.arb.ts, SFC32.arb.ts, and Splitmix32.arb.ts files', () => {
    expect(arbs).toContainAllEntries(
      Object.entries({
        ...JSF32Arbs,
        ...Mulberry32Arbs,
        ...PRNGArbs,
        ...SFC32Arbs,
        ...Splitmix32Arbs,
      }),
    )
  })
})
