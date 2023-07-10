import { List, fromJS as ogFromJS } from 'immutable'
import { Decrement, Natural, NonZero } from '../math/numeric-literals'
import { Vector } from '../math/vectors'

export type NDimensionalArray<T, N extends number> =
  N extends NonZero<Natural<N>>
    ? Array<NDimensionalArray<T, Decrement<N>>>
    : T

export type NDimensionalList<T, N extends number> =
  N extends NonZero<Natural<N>>
    ? List<NDimensionalList<T, Decrement<N>>>
    : T

export function fill <T, N extends number> (value: T, dimensions: Vector<N>): NDimensionalArray<T, N> {
  return dimensions.reduceRight<NDimensionalArray<T, N>>((acc, dim) => new Array<NDimensionalArray<T, N>>(dim).fill(acc) as NDimensionalArray<T, N>, value as NDimensionalArray<T, N>)
}

export function fromJS <T, N extends number> (nArray: NDimensionalArray<T, N>): NDimensionalList<T, N> {
  return Array.isArray(nArray) ? ogFromJS(nArray) as NDimensionalList<T, N> : nArray as NDimensionalList<T, N>
}

export function hasIn <T, N extends number> (nList: NDimensionalList<T, N>, index: Vector<N>): boolean {
  return !List.isList(nList) || nList.hasIn(index)
}

export function getIn <T, N extends number, U = undefined> (nList: NDimensionalList<T, N>, index: Vector<N>, notSetValue?: U): T | U {
  if (List.isList(nList)) {
    return nList.getIn(index, notSetValue) as T | U
  } else {
    return nList as T
  }
}

export function setIn <T, N extends number> (nList: NDimensionalList<T, N>, index: Vector<N>, value: T): NDimensionalList<T, N> {
  if (List.isList(nList)) {
    return nList.setIn(index, value) as NDimensionalList<T, N>
  } else {
    return value as NDimensionalList<T, N>
  }
}

export function toJS <T, N extends number> (nList: NDimensionalList<T, N>): NDimensionalArray<T, N> {
  return List.isList(nList) ? nList.toJS() as NDimensionalArray<T, N> : nList as NDimensionalArray<T, N>
}

export default { fill, fromJS, hasIn, getIn, setIn, toJS }
