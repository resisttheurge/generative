import { SizedTuple, map as stMap } from '../data-structures/sized-tuples'

export { size } from '../data-structures/sized-tuples'

export type Vector<N extends number> = SizedTuple<number, N>

export function printVector<N extends number>(v: Vector<N>): string {
  return `[${v.join(', ')}]`
}

export function map<N extends number>(
  v: Vector<N>,
  fn: (n: number, i: number) => number,
): Vector<N> {
  return stMap(v, fn)
}

export function scale<N extends number>(v: Vector<N>, s: number): Vector<N> {
  return map(v, n => n * s)
}

export function translate<N extends number>(
  v: Vector<N>,
  off: number | Vector<N>,
): Vector<N> {
  if (typeof off === 'number') {
    return map(v, n => n + off)
  } else {
    return map(v, (n, i) => n + off[i])
  }
}

export function transform<N extends number>(
  v: Vector<N>,
  s: number,
  off: number | Vector<N>,
): Vector<N> {
  return translate(scale(v, s), off)
}

export function magnitudeSquared<N extends number>(v: Vector<N>): number {
  return v.reduce((acc, next) => acc + next * next, 0)
}

export function magnitude<N extends number>(v: Vector<N>): number {
  return Math.sqrt(magnitudeSquared(v))
}

export function normalize<N extends number>(
  v: Vector<N>,
  factor: number = 1,
): Vector<N> {
  return scale(v, factor / magnitude(v))
}

export function distanceSquared<N extends number>(
  a: Vector<N>,
  b: Vector<N>,
): number {
  return a.reduce((acc, next, i) => {
    const diff = next - b[i]
    return acc + diff * diff
  }, 0)
}

export function distance<N extends number>(a: Vector<N>, b: Vector<N>): number {
  return Math.sqrt(distanceSquared(a, b))
}
