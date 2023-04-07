import { number } from './number'
import { map } from '../combinators'
import { normal } from './normal'
import { ofShape } from './ofShape'

// adapted from https://math.stackexchange.com/a/87238 by way of https://math.stackexchange.com/a/1113326

export const sphericalAnnulus =
  ({ dimensions = 2, innerRadius = 0, outerRadius = 1 }) => {
    return map(
      ({ radius, unitVector }) => unitVector.map(dim => dim * radius),
      ofShape({
        radius: number({ min: innerRadius, max: outerRadius }),
        unitVector: map(
          normals => {
            const factor = 1 / Math.sqrt(normals.reduce((acc, next) => acc + (next * next), 0))
            return normals.map(n => n * factor)
          },
          normal({ count: dimensions })
        )
      })
    )
  }
