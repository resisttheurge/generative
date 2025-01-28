import { mapAccum } from 'ramda'
import { Range } from '../math/ranges'
import { SizedTuple } from '../data-structures/sized-tuples'
import { OneOf } from '../data-structures/tuples'
import { List, Map } from 'immutable'
import { PRN } from '@prngs/PRNG'

export interface BooleanGeneratorConfig {
  threshold: number
  distribution: Generator<number>
}

export interface NumericGeneratorConfig extends Range {
  distribution: Generator<number>
}

export type Flatten<T> = T extends Generator<infer U> ? Flatten<U> : T

export type RewrapGenerator<T> = Generator<UnwrapGenerator<T>>
export type UnwrapGenerator<T> =
  T extends Generator<infer U>
    ? U
    : T extends [...infer U]
      ? UnwrapGeneratorTuple<U>
      : T extends { [K in keyof T]: T[K] }
        ? UnwrapGeneratorRecord<T>
        : T

export type RewrapGeneratorTuple<T extends [...any]> = // eslint-disable-line @typescript-eslint/no-explicit-any
  Generator<UnwrapGeneratorTuple<T>>
export type UnwrapGeneratorTuple<T extends [...any]> = // eslint-disable-line @typescript-eslint/no-explicit-any
  T extends [infer A, ...infer B]
    ? [UnwrapGenerator<A>, ...UnwrapGeneratorTuple<B>]
    : T extends [infer A]
      ? [UnwrapGenerator<A>]
      : T extends []
        ? []
        : T extends Array<infer A>
          ? Array<UnwrapGenerator<A>>
          : never

export type RewrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> =
  Generator<UnwrapGeneratorRecord<T>>
export type UnwrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> =
  T extends { [K in keyof T]: T[K] }
    ? { [K in keyof T]: UnwrapGenerator<T[K]> }
    : object

export type GeneratorFn<T> = (prn: PRN) => [PRN, T]

export class Generator<T> {
  constructor(readonly run: GeneratorFn<T>) {}

  static readonly uniform = new Generator(prn => [prn.next, prn.normalized])

  static run<T>(structure: T, prn: PRN): [PRN, UnwrapGenerator<T>] {
    return structure instanceof Generator
      ? structure.run(prn)
      : structure instanceof Array
        ? Generator.tuple(structure).run(prn)
        : structure instanceof Object
          ? Generator.record(structure).run(prn)
          : [prn, structure]
  }

  static constant<T>(value: T): Generator<T> {
    return new Generator(prn => [prn, value])
  }

  static bool(
    config: Partial<BooleanGeneratorConfig> = {},
  ): Generator<boolean> {
    const { threshold = 0.5, distribution = Generator.uniform } = config
    return distribution.map(n => n >= 1 - threshold)
  }

  static number(
    config: Partial<NumericGeneratorConfig> = {},
  ): Generator<number> {
    const {
      min = -2147483648,
      max = 2147483648,
      distribution = Generator.uniform,
    } = config
    return distribution.map(n => min + n * (max - min))
  }

  static int(config: Partial<NumericGeneratorConfig> = {}): Generator<number> {
    const { min = -2147483648, max = 2147483648, distribution } = config
    return Generator.number({ min, max, distribution }).map(Math.floor)
  }

  static nat(
    max: number = 2147483648,
    distribution?: Generator<number>,
  ): Generator<number> {
    return Generator.int({ min: 0, max, distribution })
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  static choose<T extends [...any]>(
    values: [...T],
    distribution?: Generator<number>,
  ): RewrapGenerator<[...T][number]> {
    return Generator.nat(values.length, distribution).chain(i => values[i])
  }

  static tuple<T extends [...any]>(values: [...T]): RewrapGeneratorTuple<T> {
    return new Generator(
      state =>
        mapAccum(
          (currentState, nextGenerator) =>
            Generator.run(nextGenerator, currentState),
          state,
          values,
        ) as [PRN, UnwrapGeneratorTuple<T>],
    )
  }

  static record<T extends Record<string, any>>(
    values: T,
  ): RewrapGeneratorRecord<T> {
    return new Generator(state => {
      const [finalState, entries] = mapAccum(
        (currentState, [nextKey, nextGenerator]) => {
          const [nextState, value] = Generator.run(nextGenerator, currentState)
          return [nextState, [nextKey, value]]
        },
        state,
        Object.entries(values),
      )
      return [finalState, Object.fromEntries(entries)]
    })
  }

  /**
   * Warning - breaks generator purity in most cases
   */
  static spread<T extends [...any]>(
    generator: Generator<T>,
  ): Generator<OneOf<T>> {
    let lastState: PRN
    let extra: Array<OneOf<T>> = []
    return new Generator(state => {
      if (extra.length === 0 || state !== lastState) {
        const [nextState, [nextValue, ...rest]] = generator.run(state)
        lastState = nextState
        extra = rest
        return [nextState, nextValue]
      } else {
        const [nextValue, ...rest] = extra
        extra = rest
        return [state, nextValue]
      }
    })
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  static sequence<T>(structure: T): RewrapGenerator<T> {
    return new Generator(prn => {
      const [nextPrn, nextValue] =
        structure instanceof Generator
          ? structure.run(prn)
          : structure instanceof Array
            ? Generator.tuple(structure).run(prn)
            : structure instanceof Object
              ? Generator.record(structure).run(prn)
              : [prn, structure]
      return [prn.variation ?? nextPrn, nextValue]
    })
  }

  chain<U>(chainFn: (generated: T) => U): RewrapGenerator<U> {
    return new Generator(state => {
      const [nextState, nextValue] = this.run(state)
      const maybeGenerator = chainFn(nextValue)
      return Generator.run(maybeGenerator, nextState)
    })
  }

  collect<Key>(
    classifier: (generated: T) => Key | Key[],
    count: number,
  ): Generator<Map<Key, List<T>>> {
    return this.repeat(count).map(samples =>
      samples.reduce<Map<Key, List<T>>>((acc, next) => {
        const keyOrKeys = classifier(next)
        for (const key of keyOrKeys instanceof Array
          ? keyOrKeys
          : [keyOrKeys]) {
          const list = acc.get(key) ?? List()
          acc = acc.set(key, list.push(next))
        }
        return acc
      }, Map()),
    )
  }

  filter(predicate: (generated: T) => boolean): Generator<T> {
    return new Generator(state => {
      let [currentState, acc] = this.run(state)
      while (!predicate(acc)) {
        const [nextState, nextValue] = this.run(currentState)
        acc = nextValue
        currentState = nextState
      }
      return [currentState, acc]
    })
  }

  flatMap<U>(generatorFn: (generated: T) => Generator<U>): Generator<U> {
    return new Generator(state => {
      const [nextState, value] = this.run(state)
      const nextGenerator = generatorFn(value)
      return nextGenerator.run(nextState)
    })
  }

  flatten(): Generator<Flatten<T>> {
    return new Generator(state => {
      let [currentState, currentValue] = this.run(state) as [PRN, Flatten<T>]
      while (currentValue instanceof Generator) {
        const [nextState, nextValue] = currentValue.run(currentState)
        currentValue = nextValue
        currentState = nextState
      }
      return [currentState, currentValue]
    })
  }

  map<U>(mapper: (generated: T) => U): Generator<U> {
    return new Generator(state => {
      const [nextState, value] = this.run(state)
      return [nextState, mapper(value)]
    })
  }

  repeat<N extends number>(count: N): Generator<SizedTuple<T, N>> {
    return new Generator(state => {
      const result = [] as SizedTuple<T, N>
      let currentState = state
      for (let i = 0; i < count; i++) {
        const [nextState, nextValue] = this.run(currentState)
        result.push(nextValue)
        currentState = nextState
      }
      return [currentState, result]
    })
  }

  reduceWhile<U>(
    reducer: (acc: U, generated: T) => U,
    predicate: (acc: U, generated: T) => boolean,
    initial: U,
  ): Generator<U> {
    return new Generator(state => {
      let [acc, currentState] = [initial, state]
      while (true) {
        const [nextState, nextValue] = this.run(currentState)
        if (!predicate(acc, nextValue)) {
          return [currentState, acc]
        }
        acc = reducer(acc, nextValue)
        currentState = nextState
      }
    })
  }
}
