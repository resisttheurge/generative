import { fc, it } from '@fast-check/jest'

import { lift } from '@utils/arbitraries'

describe('the @utils/arbitraries lift function', () => {
  it.prop([fc.anything()])(
    'should lift a non-arbitrary value into an constant arbitrary value',
    (value: unknown) => {
      const lifted = lift(value)
      expect(lifted).toBeInstanceOf(fc.Arbitrary)
      expect(fc.sample(lifted, 1)[0]).toBe(value)
    }
  )

  it.prop([fc.anything().map((value: unknown) => fc.constant(value))])(
    'should return an arbitrary unchanged',
    (arbitrary: fc.Arbitrary<unknown>) => {
      const lifted = lift(arbitrary)
      expect(lifted).toBe(arbitrary)
    }
  )
})
