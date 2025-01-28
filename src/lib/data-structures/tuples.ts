export type UnwrapTuple<T extends [...any]> = T extends [infer A, ...infer B] // eslint-disable-line @typescript-eslint/no-explicit-any
  ? [A, ...UnwrapTuple<B>]
  : T extends [infer A]
    ? [A]
    : T extends []
      ? []
      : never

export type OneOf<T extends [...any]> = T extends [infer A, ...infer B] // eslint-disable-line @typescript-eslint/no-explicit-any
  ? A | OneOf<B>
  : T extends [infer A]
    ? A
    : T extends Array<infer A>
      ? A
      : never
