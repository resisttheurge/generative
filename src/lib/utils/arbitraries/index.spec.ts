import * as arbs from './index'
import * as liftArbs from './lift.arb'

describe('the @utils/arbitraries index file', () => {
  it('should contain all entries from the constantOrElse.arb.ts and lift.arb.ts files', () => {
    expect(arbs).toContainAllEntries(
      Object.entries({
        ...liftArbs
      })
    )
  })
})
