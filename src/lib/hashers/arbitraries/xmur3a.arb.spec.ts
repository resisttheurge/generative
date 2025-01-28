import { it } from '@fast-check/jest'

import * as impl from '@hashers/xmur3a'
import * as arb from './xmur3a.arb'

describe('an arbitrary xmur3a implementation', () => {
  it.prop([arb.xmur3a()])(
    'should always be the canonical implementation',
    hasher => {
      expect(hasher).toBe(impl.xmur3a)
    },
  )
})
