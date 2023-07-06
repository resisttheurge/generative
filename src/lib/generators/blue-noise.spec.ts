import fc from 'fast-check'
import { BlueNoiseConfig, blueNoise, variations } from './blue-noise'
import { goodSeed, sizedTuple } from '../../__tests__/__utils__/arbitraries'
import { distance, distanceSquared } from '../math/vectors'

const optionLists: () => fc.Arbitrary<number[][]> = () => fc.array(fc.array(fc.integer(), { minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 10 })

const blueNoiseConfig: <Dimensions extends number> (dimensions: Dimensions) => fc.Arbitrary<BlueNoiseConfig<Dimensions>> =
  <Dimensions extends number> (dimensions: Dimensions) => fc.record({
    dimensions: sizedTuple(fc.integer({ min: 1, max: 10 }), dimensions),
    radius: fc.double({ min: 0.1, max: 10 })
  })

describe('module lib/generators/blue-noise.ts', () => {
  describe('variations <Dimensions extends number> (optionLists: SizedTuple<number[], Dimensions>): Array<Vector<Dimensions>>', () => {
    it('should generate a valid list of variations', () => {
      fc.assert(fc.property(optionLists(), (optionLists) => {
        const varied = variations(optionLists)
        expect(varied).toBeInstanceOf(Array)
        expect(varied.length).toBe(optionLists.reduce((acc, optionList) => acc * optionList.length, 1))
        expect(varied.every((vector) => vector.length === optionLists.length)).toBe(true)
        optionLists.forEach((optionList, i) => {
          optionList.forEach((option, j) => {
            expect(varied.some((vector) => vector[i] === option)).toBeTruthy()
          })
        })
      }))
    })
  })

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
