import { Generator } from '../../../generators/Generator'
import { Vector } from '../../vectors'
import { Bounds, centerPoint, contains, intersects, Query } from '../bounds'

export type CellWithData<C extends Cell<unknown>> = Omit<C, 'data'> &
  Required<Pick<C, 'data'>>

export class Cell<Data = undefined> {
  readonly bounds: Bounds
  readonly center: Vector<2>
  readonly data?: Data

  constructor(
    bounds: Bounds,
    center: Vector<2> = centerPoint(bounds),
    data?: Data,
  ) {
    this.bounds = bounds
    this.center = center
    this.data = data
  }

  contains(query: Query): boolean {
    return contains(this.bounds, query)
  }

  generate<T>(fn: (cell: Cell<Data>) => Generator<T>): Generator<Cell<T>> {
    return fn(this).map(data => new Cell(this.bounds, this.center, data))
  }

  hasData(): this is CellWithData<this> {
    return this.data !== undefined
  }

  intersects(query: Query): boolean {
    return intersects(this.bounds, query)
  }

  map<T>(fn: (cell: Cell<Data>) => T): Cell<T> {
    return new Cell(this.bounds, this.center, fn(this))
  }
}
