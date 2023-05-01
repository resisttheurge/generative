import { makeNoise2D, makeNoise3D, makeNoise4D } from 'open-simplex-noise'
import { Generator } from './Generator'
import { Vector } from '../math/vectors'

type Dimensions = 2 | 3 | 4

export interface SimplexNoiseConfig<N extends Dimensions> {
  zoom?: number
  offset?: Vector<N>
}

export function noise2D ({ zoom = 1, offset: [xOff, yOff] = [0, 0] }: SimplexNoiseConfig<2> = {}): Generator<([x, y]: [number, number]) => number> {
  return Generator.int().map(seed => {
    const noise = makeNoise2D(seed)
    return ([x, y]: Vector<2>) => noise((x + xOff) / zoom, (y + yOff) / zoom)
  })
}

export function noise3D ({ zoom = 1, offset: [xOff, yOff, zOff] = [0, 0, 0] }: SimplexNoiseConfig<3> = {}): Generator<([x, y, z]: Vector<3>) => number> {
  return Generator.int().map(seed => {
    const noise = makeNoise3D(seed)
    return ([x, y, z]: Vector<3>) => noise((x + xOff) / zoom, (y + yOff) / zoom, (z + zOff) / zoom)
  })
}

export function noise4D ({ zoom = 1, offset: [xOff, yOff, zOff, wOff] = [0, 0, 0, 0] }: SimplexNoiseConfig<4> = {}): Generator<([x, y, z, w]: Vector<4>) => number> {
  return Generator.int().map(seed => {
    const noise = makeNoise4D(seed)
    return ([x, y, z, w]: Vector<4>) => noise((x + xOff) / zoom, (y + yOff) / zoom, (z + zOff) / zoom, (w + wOff) / zoom)
  })
}
