import * as prngs from './index'
import * as JSF32 from './JSF32'
import * as Mulberry32 from './Mulberry32'
import * as PRNG from './PRNG'
import * as SFC32 from './SFC32'
import * as Splitmix32 from './Splitmix32'

describe('the lib/prngs index file', () => {
  it('should contain all entries from the JSF32.ts, Mulberry32.ts, PRNG.ts, SFC32.ts, and Splitmix32.ts files', () => {
    expect(prngs).toContainAllEntries(
      Object.entries({
        ...JSF32,
        ...Mulberry32,
        ...PRNG,
        ...SFC32,
        ...Splitmix32,
      }),
    )
  })
})
