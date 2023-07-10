export type UnwrapTuple<T extends [...any]> =
  T extends [infer A, ...infer B]
    ? [A, ...UnwrapTuple<B>]
    : T extends [infer A]
      ? [A]
      : T extends []
        ? []
        : never

export type OneOf<T extends [...any]> =
  T extends [infer A, ...infer B]
    ? A | OneOf<B>
    : T extends [infer A]
      ? A
      : T extends Array<infer A>
        ? A
        : never
