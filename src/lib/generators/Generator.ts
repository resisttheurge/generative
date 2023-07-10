import { mapAccum } from 'ramda'
import * as splitmix32 from '../math/splitmix32'
import { Range } from '../math/ranges'
import * as xmur3a from '../math/xmur3a'
import { SizedTuple } from '../data-structures/sized-tuples'
import { OneOf } from '../data-structures/tuples'
import { List, Map } from 'immutable'

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
    : T extends [...any]
      ? UnwrapGeneratorTuple<T>
      : T extends { [K in keyof T]: T[K] }
        ? UnwrapGeneratorRecord<T>
        : T

export type RewrapGeneratorTuple<T extends [...any]> = Generator<UnwrapGeneratorTuple<T>>
export type UnwrapGeneratorTuple<T extends [...any]> =
  T extends [infer A, ...infer B]
    ? [UnwrapGenerator<A>, ...UnwrapGeneratorTuple<B>]
    : T extends [infer A]
      ? [UnwrapGenerator<A>]
      : T extends Array<infer A>
        ? Array<UnwrapGenerator<A>>
        : []

export type RewrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> = Generator<UnwrapGeneratorRecord<T>>
export type UnwrapGeneratorRecord<T extends { [K in keyof T]: T[K] }> =
  T extends { [K in keyof T]: T[K] }
    ? { [K in keyof T]: UnwrapGenerator<T[K]> }
    : {}

export type GeneratorFn<T> = (state: number) => [number, T]

export class Generator<T> {
  static initSeed: (seedString: string) => number = xmur3a.hashString

  static hashState: (state: number) => number = xmur3a.hashState

  static uniform: Generator<number> = new Generator(splitmix32.next)

  readonly run: GeneratorFn<T>

  constructor (run: GeneratorFn<T>) {
    this.run = run
  }

  static run <T> (generator: T | Generator<T>, state: number): [number, T] {
    return generator instanceof Generator
      ? generator.run(state)
      : [state, generator]
  }

  static sequence <T> (structure: T): RewrapGenerator<T> {
    return new Generator(state => {
      const [,nextValue] =
      structure instanceof Generator
        ? structure.run(state)
        : structure instanceof Array
          ? Generator.tuple(structure).run(state)
          : structure instanceof Object
            ? Generator.record(structure).run(state)
            : [state, structure]
      return [Generator.hashState(state), nextValue]
    })
  }

  static constant <T> (value: T): Generator<T> {
    return new Generator(state => [state, value])
  }

  static bool (config: Partial<BooleanGeneratorConfig> = {}): Generator<boolean> {
    const { threshold = 0.5, distribution = Generator.uniform } = config
    return distribution.map(n => n >= (1 - threshold))
  }

  static number (config: Partial<NumericGeneratorConfig> = {}): Generator<number> {
    const { min = -2147483648, max = 2147483648, distribution = Generator.uniform } = config
    return distribution.map(n => min + (n * (max - min)))
  }

  static int (config: Partial<NumericGeneratorConfig> = {}): Generator<number> {
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
        (currentState, nextGenerator) =>
          Generator.sequence(nextGenerator).run(currentState),
        state,
        values
      ) as [number, UnwrapGeneratorTuple<T>]
    )
  }

  static record <T extends Record<string, any>> (values: T): RewrapGeneratorRecord<T> {
    return new Generator(state => {
      const [finalState, entries] = mapAccum(
        (currentState, [nextKey, nextGenerator]) => {
          const [nextState, value] = Generator.sequence(nextGenerator).run(currentState)
          return [nextState, [nextKey, value]]
        },
        state,
        Object.entries(values)
      )
      return [finalState, Object.fromEntries(entries)]
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

  chain <U> (chainFn: (generated: T) => U | Generator<U>): Generator<U> {
    return new Generator(state => {
      const [nextState, nextValue] = this.run(state)
      const maybeGenerator = chainFn(nextValue)
      return Generator.run(maybeGenerator, nextState)
    })
  }

  collect <Key> (classifier: (generated: T) => Key | Key[], count: number): Generator<Map<Key, List<T>>> {
    return this.repeat(count).map(samples =>
      samples.reduce<Map<Key, List<T>>>(
        (acc, next) => {
          const keyOrKeys = classifier(next)
          for (const key of keyOrKeys instanceof Array ? keyOrKeys : [keyOrKeys]) {
            const list = acc.get(key) ?? List()
            acc = acc.set(key, list.push(next))
          }
          return acc
        },
        Map()
      )
    )
  }

  filter (predicate: (generated: T) => boolean): Generator<T> {
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

  flatMap <U> (generatorFn: (generated: T) => Generator<U>): Generator<U> {
    return new Generator(state => {
      const [nextState, value] = this.run(state)
      const nextGenerator = generatorFn(value)
      return nextGenerator.run(nextState)
    })
  }

  flatten (): Generator<Flatten<T>> {
    return new Generator(state => {
      let [currentState, currentValue] = this.run(state) as [number, Flatten<T>]
      while (currentValue instanceof Generator) {
        const [nextState, nextValue] = currentValue.run(currentState)
        currentValue = nextValue
        currentState = nextState
      }
      return [currentState, currentValue]
    })
  }

  map <U> (mapper: (generated: T) => U): Generator<U> {
    return new Generator(state => {
      const [nextState, value] = this.run(state)
      return [nextState, mapper(value)]
    })
  }

  repeat <N extends number> (count: N): Generator<SizedTuple<T, N>> {
    return new Generator(state => {
      const generator = Generator.sequence(this as Generator<T>)
      let [result, currentState] = [[] as SizedTuple<T, N>, state]
      for (let i = 0; i < count; i++) {
        const [nextState, nextValue] = generator.run(currentState)
        result.push(nextValue)
        currentState = nextState
      }
      return [currentState, result]
    })
  }

  reduceWhile <U> (reducer: (acc: U, generated: T) => U, predicate: (acc: U, generated: T) => boolean, initial: U): Generator<U> {
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
