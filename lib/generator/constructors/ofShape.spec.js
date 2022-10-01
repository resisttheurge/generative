/* eslint-env jest */

import fc from 'fast-check'

import { ofShape } from './ofShape'

import { arbSeed } from '../seeder.spec'
import { shouldBeAGeneratorConstructor } from './index.spec'
import { arbGenerator } from '../index.spec'
import { isGenerator } from '../Generator'

export const arbShape =
  () =>
    fc.letrec(tie => ({
      shape: fc.oneof({ depthSize: 'small' }, tie('con'), tie('gen'), tie('array'), tie('object')),
      con: fc.anything(),
      gen: arbGenerator(),
      array: fc.array(tie('shape'), { size: 'small' }),
      object: fc.dictionary(fc.string(), tie('shape'), { size: 'small' })
    })).shape

export const arbOfShape =
  (shape = arbShape()) =>
    shape.map(ofShape)

describe('The ofShape Generator constructor', () => {
  shouldBeAGeneratorConstructor(arbOfShape)
  it('should return a Generator that matches the shape of the given config object', () => {
    fc.assert(
      fc.property(
        arbShape(),
        arbSeed(),
        (shape, seed) => {
          const [value] = ofShape(shape)(seed)
          if (shape !== undefined && !isGenerator(shape)) {
            expect(value).toBeDefined()
          }
        }
      )
    )
  })
})
