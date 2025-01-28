import fc from 'fast-check'
import { List } from 'immutable'

import { ConcretePRN, PRN, PRNG } from '@prngs/PRNG'
import { Liftable, lift } from '@utils/arbitraries'

export interface PRNGConstraints {
  name?: Liftable<string | undefined>
  range?: Liftable<[number, number]>
  noHashState?: Liftable<boolean>
  noFormatState?: Liftable<boolean>
}

export function prng(): fc.Arbitrary<PRNG<unknown>>

export function prng<State>(
  stateArbitrary?: fc.Arbitrary<State>,
  constraints?: PRNGConstraints,
): fc.Arbitrary<PRNG<State>>

export function prng(
  stateArbitrary = fc.anything(),
  {
    name = fc.option(fc.string(), { nil: undefined }),
    range = fc
      .integer({
        max: 0x7ffffffe,
      })
      .chain(min =>
        fc
          .integer({
            min: min + 1,
          })
          .map(max => [min, max]),
      ),
    noHashState = fc.boolean(),
    noFormatState = fc.boolean(),
  }: PRNGConstraints = {},
): fc.Arbitrary<PRNG<unknown>> {
  return fc
    .record({
      range: lift(range),
      noHashState: lift(noHashState),
      noFormatState: lift(noFormatState),
    })
    .chain(({ range: [min, max], noHashState, noFormatState }) =>
      fc.record({
        name: lift(name),
        min: fc.constant(min),
        max: fc.constant(max),
        initState: fc.func(stateArbitrary),
        nextState: fc.func(stateArbitrary),
        hashState: lift(noHashState ? undefined : fc.func(fc.string())),
        formatState: lift(noFormatState ? undefined : JSON.stringify),
        extractValue: fc.func(fc.double({ min, max, noNaN: true })),
      }),
    )
}

export interface PRNConstraints {
  seed?: Liftable<string>
  offset?: Liftable<number>
  iteration?: Liftable<number>
  noVariation?: Liftable<boolean>
  maxPathIterations?: Liftable<number>
  pathSize?: Liftable<fc.Size>
}

export function prn(): fc.Arbitrary<ConcretePRN<unknown>>

export function prn<State>(
  prngArbitrary?: fc.Arbitrary<PRNG<State>>,
  constraints?: PRNConstraints,
): fc.Arbitrary<ConcretePRN<State>>

export function prn(
  prngArbitrary = prng(),
  {
    seed = fc.string(),
    offset = fc.nat(100),
    iteration = fc.nat(100),
    noVariation = fc.boolean(),
    maxPathIterations = 100,
    pathSize = 'small',
  }: PRNConstraints = {},
): fc.Arbitrary<PRN> {
  return fc
    .record({
      prng: prngArbitrary,
      seed: lift(seed),
      offset: lift(offset),
      iteration: lift(iteration),
      noVariation: lift(noVariation),
      maxPathIterations: lift(maxPathIterations),
      pathSize: lift(pathSize),
    })
    .chain(
      ({
        prng,
        seed,
        offset,
        iteration,
        noVariation,
        maxPathIterations,
        pathSize,
      }) => {
        noVariation = noVariation || prng.hashState === undefined
        return lift(
          noVariation
            ? List<number>()
            : fc.array(fc.nat(maxPathIterations), { size: pathSize }).map(List),
        ).map(
          path =>
            new ConcretePRN(
              prng,
              seed,
              noVariation ? 0 : offset,
              path,
              iteration,
            ),
        )
      },
    )
}
