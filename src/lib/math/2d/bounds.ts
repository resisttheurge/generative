import { curry } from 'ramda'
import { printVector, Vector } from '../vectors'

export interface Bounds {
  readonly min: Vector<2>
  readonly max: Vector<2>
}

export type Query = Vector<2> | Bounds

export function printBounds (bounds: Bounds): string {
  return `Bounds{${printVector(bounds.min)}, ${printVector(bounds.max)}}`
}

export function centerPoint (bounds: Bounds): Vector<2> {
  const { min: [x1, y1], max: [x2, y2] } = bounds
  return [
    x1 + (x2 - x1) / 2,
    y1 + (y2 - y1) / 2
  ]
}

export const contains = curry(
  (bounds: Bounds, query: Query): boolean =>
    Array.isArray(query)
      ? query[0] >= bounds.min[0] &&
        query[1] >= bounds.min[1] &&
        query[0] <= bounds.max[0] &&
        query[1] <= bounds.max[1]
      : contains(bounds, query.min) &&
        contains(bounds, query.max)
)

// From https://stackoverflow.com/a/306332
// demo: https://silentmatt.com/rectangle-intersection/
export const intersects = curry(
  (bounds: Bounds, query: Query): boolean =>
    Array.isArray(query)
      ? contains(bounds, query)
      : bounds.min[0] < query.max[0] &&
        bounds.max[0] > query.min[0] &&
        bounds.min[1] < query.max[1] &&
        bounds.max[1] > query.min[1]
)
