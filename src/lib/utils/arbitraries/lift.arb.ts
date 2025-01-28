import { Arbitrary, constant } from 'fast-check'

/**
 * A type that can be lifted into an arbitrary.
 *
 * Specifically, this type is either a concrete type or already an
 * arbitrary of that type.
 *
 * @template T The type to be lifted.
 */
export type Liftable<T> = T | Arbitrary<T>

/**
 * Lifts a Liftable<T> into an Arbitrary<T> by
 * wrapping it in a call to fc.constant() if it is not already an
 * arbitrary.
 *
 * @param liftable the value to lift into an arbitrary.
 * @returns an arbitrary of the liftable value.
 */
export function lift<T>(liftable: Liftable<T>): Arbitrary<T> {
  if (liftable instanceof Arbitrary) {
    return liftable
  } else {
    return constant(liftable)
  }
}
