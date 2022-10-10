import * as simplex from 'open-simplex-noise'
import { pipe } from 'ramda'
import { map } from '../combinators'
import { int } from './int'

export const simplexNoise1d =
  ({ zoom = 1, y = 0 } = {}) =>
    map(
      pipe(
        simplex.makeNoise2D,
        f => x => f(x / zoom, y / zoom)
      ),
      int()
    )

export const simplexNoise2d =
  ({ zoom = 1 } = {}) =>
    map(
      pipe(
        simplex.makeNoise2D,
        f => (x, y) => f(x / zoom, y / zoom)
      ),
      int()
    )

export const simplexNoise3d =
    ({ zoom = 1 } = {}) =>
      map(
        pipe(
          simplex.makeNoise3D,
          f => (x, y, z) => f(x / zoom, y / zoom, z / zoom)
        ),
        int()
      )

export const simplexNoise4d =
  ({ zoom = 1 } = {}) =>
    map(
      pipe(
        simplex.makeNoise4D,
        f => (x, y, z, w) => f(x / zoom, y / zoom, z / zoom, w / zoom)
      ),
      int()
    )

export const simplexNoise =
  ({ dimensions = 2, zoom = 1, y = 0 } = {}) => {
    switch (dimensions) {
      case 1: return simplexNoise1d({ zoom, y })
      case 2: return simplexNoise2d({ zoom })
      case 3: return simplexNoise3d({ zoom })
      case 4: return simplexNoise4d({ zoom })
    }
  }
