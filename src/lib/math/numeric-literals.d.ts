export type Number<N extends number> =
  N extends N
    ? number extends N
      ? never
      : N
    : never

export type Int<N extends number> =
  N extends Number<N>
    ? `${N}` extends `${number}.${number}`
      ? never
      : N
    : never

export type Float<N extends number> =
  N extends Number<N>
    ? `${N}` extends `${number}.${number}`
      ? N
      : never
    : never

export type NonZero<N extends number> =
  N extends Number<N>
    ? N extends 0
      ? never
      : N
    : never

export type Positive<N extends number> =
  N extends Number<N>
    ? `${N}` extends `-${number}` | `-${number}.${number}`
      ? never
      : N
    : never

export type Negative<N extends number> =
  N extends Number<N>
    ? `${N}` extends `-${number}` | `-${number}.${number}` | '0'
      ? N
      : never
    : never

export type Natural<N extends number> = Positive<Int<N>>

type Counter<Size extends number> =
  CounterOf<Size, []>

type CounterOf<Size extends number, R extends unknown[]> =
  R['length'] extends Size
    ? R
    : CounterOf<Size, [unknown, ...R]>

export type Increment<N extends number> =
  N extends Natural<N>
    ? [...Counter<N>, unknown]['length']
    : never

export type Decrement<N extends number> =
  N extends NonZero<Natural<N>>
    ? Counter<N> extends [unknown, ...infer Tail]
      ? Tail['length']
      : never
    : never

export type Add <A extends number, B extends number> =
  [A, B] extends [Natural<A>, Natural<B>]
    ? [...Counter<A>, ...Counter<B>]['length']
    : never

export type Multiply <A extends number, B extends number> =
    [A, B] extends [Natural<A>, Natural<B>]
      ? MultiplyAccumulator<A, B, [], []>
      : never

type MultiplyAccumulator <A extends number, B extends number, R extends unknown[], Acc extends unknown[]> =
  Acc['length'] extends B
    ? R['length']
    : MultiplyAccumulator<A, B, [...R, ...Counter<A>], [...Acc, unknown]>
