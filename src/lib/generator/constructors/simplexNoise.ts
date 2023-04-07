import * as simplex from 'open-simplex-noise'
import { pipe } from 'ramda'
import invariant from 'tiny-invariant'
import { map } from '../combinators'
import { int } from './int'

export const simplexNoise1d =
  ({ zoom = 1, offset: { x: xOff = 0, y: yOff = 0 } = {} } = {}) =>
    map(
      pipe(
        simplex.makeNoise2D,
        f => x => f((xOff + x) / zoom, yOff / zoom)
      ),
      int()
    )

export const simplexNoise2d =
  ({ zoom = 1, offset: { x: xOff = 0, y: yOff = 0 } = {} } = {}) =>
    map(
      pipe(
        simplex.makeNoise2D,
        f => (x, y) => f((xOff + x) / zoom, (yOff + y) / zoom)
      ),
      int()
    )

export const simplexNoise3d =
    ({ zoom = 1, offset: { x: xOff = 0, y: yOff = 0, z: zOff = 0 } } = {}) =>
      map(
        pipe(
          simplex.makeNoise3D,
          f => (x, y, z) => f((xOff + x) / zoom, (yOff + y) / zoom, (zOff + z) / zoom)
        ),
        int()
      )

export const simplexNoise4d =
  ({ zoom = 1, offset: { x: xOff = 0, y: yOff = 0, z: zOff = 0, w: wOff = 0 } = {} } = {}) =>
    map(
      pipe(
        simplex.makeNoise4D,
        f => (x, y, z, w) => f((xOff + x) / zoom, (yOff + y) / zoom, (zOff + z) / zoom, (wOff + w) / zoom)
      ),
      int()
    )

export const simplexNoise =
  ({ dimensions = 2, zoom = 1, offset = { x: 0, y: 0, z: 0, w: 0 } } = {}) => {
    invariant(dimensions > 0 && dimensions < 5, 'Simplex noise is only supported for 1, 2, 3, and 4 dimensions')
    switch (dimensions) {
      case 1: return simplexNoise1d({ zoom, offset })
      case 2: return simplexNoise2d({ zoom, offset })
      case 3: return simplexNoise3d({ zoom, offset })
      case 4: return simplexNoise4d({ zoom, offset })
    }
  }
