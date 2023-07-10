import fc from 'fast-check'
import { BlueNoiseConfig, blueNoise } from './blue-noise'
import { goodSeed, sizedTuple } from '../../__tests__/__utils__/arbitraries'
import { distance } from '../math/vectors'

const blueNoiseConfig: <Dimensions extends number> (dimensions: Dimensions) => fc.Arbitrary<BlueNoiseConfig<Dimensions>> =
  <Dimensions extends number> (dimensions: Dimensions) => fc.record({
    dimensions: sizedTuple(fc.integer({ min: 1, max: 10 }), dimensions),
    radius: fc.double({ min: 0.1, max: 10 })
  })

describe('module lib/generators/blue-noise.ts', () => {
  describe('blueNoise <Dimensions extends number> (config: BlueNoiseConfig<Dimensions>, initialPosition?: Vector<Dimensions>): Generator<Array<Vector<Dimensions>>>', () => {
    it('should always return a generator of points which are always at least config.radius apart from one another', () => {
      fc.assert(fc.property(blueNoiseConfig(2), goodSeed(), (config, seed) => {
        const generator = blueNoise(config)
        const [, points] = generator.run(seed)
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            expect(distance(points[i], points[j])).toBeGreaterThanOrEqual(config.radius)
          }
        }
      }), { seed: -348449661, path: '1:0:0:0:0', endOnFailure: true })
    })
  })
})
