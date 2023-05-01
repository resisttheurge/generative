import invariant from 'tiny-invariant'
import paper from 'paper'
import { Vector } from '../math/vectors'

export type Point = paper.Point
export type Path = paper.Path

export function drawCurve (curve: Array<Vector<2>>, close: boolean = false): Path {
  invariant(curve.length > 1, 'Curve must have at least two points')
  const path = new paper.Path()
  const [start, ...rest] = curve
  path.moveTo(start)
  rest.forEach(point => path.lineTo(point))
  if (close) {
    path.closePath()
  }
  return path
}
