import fc from 'fast-check'

import { sizedTuple } from '@data-structures/arbitraries'
import { jsf32, mulberry32, prn, sfc32, splitmix32 } from '@prngs/arbitraries'
import { distanceSquared } from '../math/vectors'
import { BlueNoiseConfig, blueNoise } from './blue-noise'

const blueNoiseConfig: <Dimensions extends number>(
  dimensions: Dimensions,
) => fc.Arbitrary<BlueNoiseConfig<Dimensions>> = <Dimensions extends number>(
  dimensions: Dimensions,
) =>
  fc.record({
    dimensions: sizedTuple(fc.integer({ min: 1, max: 10 }), dimensions),
    radius: fc.double({
      min: 2,
      max: 10,
      noDefaultInfinity: true,
      noNaN: true,
    }),
  })

describe('module lib/generators/blue-noise.ts', () => {
  describe('blueNoise <Dimensions extends number> (config: BlueNoiseConfig<Dimensions>, initialPosition?: Vector<Dimensions>): Generator<Array<Vector<Dimensions>>>', () => {
    it('should always return a generator of points which are always at least config.radius apart from one another', () => {
      fc.assert(
        fc.property(
          blueNoiseConfig(2),
          prn<any>(fc.oneof(jsf32(), mulberry32(), sfc32(), splitmix32())), // eslint-disable-line @typescript-eslint/no-explicit-any
          (config, seed) => {
            const generator = blueNoise(config)
            const [, points] = generator.run(seed)
            for (let i = 0; i < points.length; i++) {
              for (let j = i + 1; j < points.length; j++) {
                const dist = distanceSquared(points[i], points[j])
                const radiusSquared = config.radius ** 2
                if (dist < radiusSquared) {
                  expect(dist).toBeCloseTo(radiusSquared)
                } else {
                  expect(dist).toBeGreaterThanOrEqual(radiusSquared)
                }
              }
            }
          },
        ),
      )
    })
  })
})
