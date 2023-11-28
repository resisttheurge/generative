import * as hashers from './index'
import * as Hasher from './Hasher'
import * as xmur3a from './xmur3a'

describe('the lib/hashers index file', () => {
  it(
    'should contain all entries from the Hasher.ts and xmur3a.ts files',
    () => {
      expect(hashers).toContainAllEntries(
        Object.entries({
          ...Hasher,
          ...xmur3a
        })
      )
    })
})
