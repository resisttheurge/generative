import { range } from 'ramda'

export type SizedTuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : SizedTupleTypeAccumulator<T, N, []>
  : never

type SizedTupleTypeAccumulator<
  T,
  N extends number,
  R extends unknown[],
> = R['length'] extends N ? R : SizedTupleTypeAccumulator<T, N, [T, ...R]>

/* eslint-disable @typescript-eslint/no-explicit-any */
export function size<N extends number>(tuple: SizedTuple<any, N>): N {
  return tuple.length as N
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function fill<T, N extends number>(
  value: T,
  count: N,
): SizedTuple<T, N> {
  return range(0, count).map(() => value) as SizedTuple<T, N>
}

export function map<T, U, N extends number>(
  tuple: SizedTuple<T, N>,
  mapperFn: (elem: T, idx: number) => U,
): SizedTuple<U, N> {
  return tuple.map(mapperFn) as SizedTuple<U, N>
}

export function zip2<A, B, N extends number>(
  a: SizedTuple<A, N>,
  b: SizedTuple<B, N>,
): SizedTuple<[A, B], N> {
  return map(a, (elem, idx) => [elem, b[idx]])
}

export function zip2With<A, B, C, N extends number>(
  a: SizedTuple<A, N>,
  b: SizedTuple<B, N>,
  f: (a: A, b: B) => C,
): SizedTuple<C, N> {
  return map(a, (elem, idx) => f(elem, b[idx]))
}

export function cartesianProduct<T, Dimensions extends number>(
  sets: SizedTuple<T[], Dimensions>,
): Array<SizedTuple<T, Dimensions>> {
  return sets.reduce<Array<SizedTuple<T, Dimensions>>>(
    (lastVariations, nextOptionList) => {
      const nextVariations = [] as Array<SizedTuple<T, Dimensions>>
      for (const variation of lastVariations) {
        for (const option of nextOptionList) {
          nextVariations.push([...variation, option] as SizedTuple<
            T,
            Dimensions
          >)
        }
      }
      return nextVariations
    },
    [[] as SizedTuple<T, Dimensions>],
  )
}
