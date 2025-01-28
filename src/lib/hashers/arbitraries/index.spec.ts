import * as arbs from './index'
import * as hasherArbs from './Hasher.arb'
import * as xmur3aArbs from './xmur3a.arb'

describe('the @hashers/arbitraries index file', () => {
  it('should contain all entries from the Hasher.arb.ts and xmur3a.arb.ts files', () => {
    expect(arbs).toContainAllEntries(
      Object.entries({
        ...hasherArbs,
        ...xmur3aArbs,
      }),
    )
  })
})
