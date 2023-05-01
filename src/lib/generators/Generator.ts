import { mapAccum } from 'ramda'
import * as mulberry32 from '../math/mulberry32'
import { Range } from '../math/ranges'
import * as xmur3a from '../math/xmur3a'
import { SizedTuple } from '../data-structures/sized-tuples'
import { OneOf } from '../data-structures/tuples'

interface BooleanConfig {
  threshold: number
  distribution: Generator<number>
}

interface NumericConfig extends Range {
  distribution: Generator<number>
}

type Flatten<T> = T extends Generator<infer U> ? Flatten<U> : T

type RewrapGenerator<T> = Generator<UnwrapGenerator<T>>
type UnwrapGenerator<T> =
  T extends Generator<infer U>
    ? U
    : T extends [...any]
      ? UnwrapGeneratorTuple<T>
      : T extends { [K in keyof T]: T[K] }
        ? UnwrapGeneratorRecord<T>
        : T

type RewrapGeneratorTuple<T extends [...any]> = Generator<UnwrapGeneratorTuple<T>>
type UnwrapGeneratorTuple<T extends [...any]> =
  T extends [infer A, ...infer B]
    ? [UnwrapGenerator<A>, ...UnwrapGeneratorTuple<B>]
    : T extends [infer A]
      ? [UnwrapGenerator<A>]
      : T extends Array<infer A>
        ? Array<UnwrapGenerator<A>>
        : []

type RewrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> = Generator<UnwrapGeneratorRecord<T>>
type UnwrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> =
  T extends { [K in keyof T]: T[K] }
    ? { [K in keyof T]: UnwrapGenerator<T[K]> }
    : {}

export type GeneratorFn<T> = (state: number) => [T, number]

export class Generator<T> {
  static initSeed: (initSeed: string) => number = xmur3a.hashString

  static hashState: (state: number) => number = xmur3a.hashState

  static uniform: Generator<number> = new Generator(mulberry32.nextState)

  readonly run: GeneratorFn<T>

  constructor (run: GeneratorFn<T>) {
    this.run = run
  }

  static safeRun <T> (generator: T | Generator<T>, state: number): [T, number] {
    return generator instanceof Generator
      ? generator.run(state)
      : [generator, state]
  }

  static sequence <T> (structure: T): RewrapGenerator<T> {
    return new Generator(state => {
      const [nextValue] =
      structure instanceof Generator
        ? structure.run(state)
        : structure instanceof Array
          ? Generator.tuple(structure).run(state)
          : structure instanceof Object
            ? Generator.record(structure).run(state)
            : [structure]
      return [nextValue, Generator.hashState(state)]
    })
  }

  static constant <T> (value: T): Generator<T> {
    return new Generator(seed => [value, seed])
  }

  static bool (config: Partial<BooleanConfig> = {}): Generator<boolean> {
    const { threshold = 0.5, distribution = Generator.uniform } = config
    return distribution.map(n => n >= (1 - threshold))
  }

  static number (config: Partial<NumericConfig> = {}): Generator<number> {
    const { min = -2147483648, max = 2147483648, distribution = Generator.uniform } = config
    return distribution.map(n => min + (n * (max - min)))
  }

  static int (config: Partial<NumericConfig> = {}): Generator<number> {
    const { min = -2147483648, max = 2147483648, distribution } = config
    return Generator.number({ min, max, distribution }).map(Math.floor)
  }

  static nat (max: number = 2147483648, distribution?: Generator<number>): Generator<number> {
    return Generator.int({ min: 0, max, distribution })
  }

  static choose <T extends [...any]> (values: [...T], distribution?: Generator<number>): Generator<OneOf<UnwrapGeneratorTuple<T>>> {
    return Generator.nat(values.length, distribution).chain(i => values[i])
  }

  static tuple <T extends [...any]> (values: [...T]): RewrapGeneratorTuple<T> {
    return new Generator(state =>
      mapAccum(
        (currentState, nextGenerator) => {
          const [value, nextState] = Generator.sequence(nextGenerator).run(currentState)
          return [nextState, value]
        },
        state,
        values
      ).reverse() as [UnwrapGeneratorTuple<T>, number]
    )
  }

  static record <T extends Record<string, any>> (values: T): RewrapGeneratorRecord<T> {
    return new Generator(state => {
      const [finalSeed, entries] = mapAccum(
        (currentState, [nextKey, nextGenerator]) => {
          const [value, nextState] = Generator.sequence(nextGenerator).run(currentState)
          return [nextState, [nextKey, value]]
        },
        state,
        Object.entries(values)
      )
      return [Object.fromEntries(entries), finalSeed]
    })
  }

  /**
   * Warning - breaks generator purity in most cases
   */
  static spread <T extends [...any]> (generator: Generator<T>): Generator<OneOf<T>> {
    let lastState: number = 0
    let extra: Array<OneOf<T>> = []
    return new Generator(state => {
      if (extra.length === 0 || state !== lastState) {
        const [[nextValue, ...rest], nextState] = generator.run(state)
        lastState = nextState
        extra = rest
        return [nextValue, nextState]
      } else {
        const [nextValue, ...rest] = extra
        extra = rest
        return [nextValue, state]
      }
    })
  }

  chain <U> (chainFn: (generated: T) => U | Generator<U>): Generator<U> {
    return new Generator(seed => {
      const [value, nextState] = this.run(seed)
      const maybeGenerator = chainFn(value)
      return Generator.safeRun(maybeGenerator, nextState)
    })
  }

  filter (predicate: (generated: T) => boolean): Generator<T> {
    return new Generator(seed => {
      let [acc, currentSeed] = this.run(seed)
      while (!predicate(acc)) {
        const [next, nextSeed] = this.run(currentSeed)
        acc = next
        currentSeed = nextSeed
      }
      return [acc, currentSeed]
    })
  }

  flatMap <U> (generatorFn: (generated: T) => Generator<U>): Generator<U> {
    return new Generator(state => {
      const [value, nextState] = this.run(state)
      const nextGenerator = generatorFn(value)
      return nextGenerator.run(nextState)
    })
  }

  flatten (): Generator<Flatten<T>> {
    return new Generator(seed => {
      let [value, currentSeed] = this.run(seed) as [Flatten<T>, number]
      while (value instanceof Generator) {
        const [nextValue, nextSeed] = value.run(currentSeed)
        value = nextValue
        currentSeed = nextSeed
      }
      return [value, currentSeed]
    })
  }

  map <U> (mapper: (generated: T) => U): Generator<U> {
    return new Generator(state => {
      const [value, nextState] = this.run(state)
      return [mapper(value), nextState]
    })
  }

  repeat <N extends number> (count: N): Generator<SizedTuple<T, N>> {
    return new Generator(seed => {
      const generator = Generator.sequence(this as Generator<T>)
      let [result, currentSeed] = [[] as SizedTuple<T, N>, seed]
      for (let i = 0; i < count; i++) {
        const [nextValue, nextSeed] = generator.run(currentSeed)
        result.push(nextValue)
        currentSeed = nextSeed
      }
      return [result, currentSeed]
    })
  }

  reduceWhile <U> (reducer: (acc: U, generated: T) => U, predicate: (acc: U, generated: T) => boolean, initial: U): Generator<U> {
    return new Generator(state => {
      let [acc, currentState] = [initial, state]
      while (true) {
        const [value, nextState] = this.run(currentState)
        if (!predicate(acc, value)) {
          return [acc, currentState]
        }
        acc = reducer(acc, value)
        currentState = nextState
      }
    })
  }
}
