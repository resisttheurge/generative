import Flatbush from 'flatbush'
import invariant from 'tiny-invariant'
import { Generator } from '../../../generators/Generator'
import { Bounds, centerPoint, contains, intersects, Query } from '../bounds'
import { Cell } from './Cell'

interface NeighborConfig<Data = undefined> {
  maxResults?: number
  maxDistance?: number
  filter?: (cell: Cell<Data>) => boolean
}

export class Field<Data = undefined> {
  readonly index: Flatbush
  readonly bounds: Bounds

  constructor(
    readonly cells: Array<Cell<Data>>,
    indexData?: ArrayBuffer,
  ) {
    this.cells = cells

    if (indexData !== undefined) {
      this.index = Flatbush.from(indexData)
    } else {
      this.index = new Flatbush(cells.length)
      this.cells.forEach(cell =>
        this.index.add(...cell.bounds.min, ...cell.bounds.max),
      )
      this.index.finish()
    }

    invariant(
      this.index.numItems === this.cells.length,
      () =>
        `Index size (${this.index.numItems}) does not match number of given cells (${this.cells.length})`,
    )

    this.bounds = {
      min: [this.index.minX, this.index.minY],
      max: [this.index.maxX, this.index.maxY],
    }
  }

  contains(query: Query): boolean {
    return (
      contains(this.bounds, query) &&
      this.find(query, cell => cell.contains(query)) !== undefined
    )
  }

  find(
    query: Query,
    filter?: (cell: Cell<Data>) => boolean,
  ): Cell<Data> | undefined {
    return this.findAll(query, filter)[0]
  }

  findAll(
    query: Query,
    filter?: (cell: Cell<Data>) => boolean,
  ): Array<Cell<Data>> {
    const idxFilter =
      filter !== undefined
        ? (idx: number) => filter(this.cells[idx])
        : undefined

    const { min, max } = Array.isArray(query)
      ? { min: query, max: query }
      : query

    return this.index
      .search(...min, ...max, idxFilter)
      .map(idx => this.cells[idx])
  }

  intersects(query: Query): boolean {
    return (
      intersects(this.bounds, query) &&
      this.find(query, cell => cell.intersects(query)) !== undefined
    )
  }

  map<T>(fn: (cell: Cell<Data>) => T): Field<T> {
    return new Field(
      this.cells.map(cell => cell.map(fn)),
      this.index.data,
    )
  }

  neighbors(
    query: Query,
    { maxResults, maxDistance, filter }: NeighborConfig<Data> = {},
  ): Array<Cell<Data>> {
    const position = !Array.isArray(query) ? centerPoint(query) : query

    const idxFilter =
      filter !== undefined
        ? (idx: number) => filter(this.cells[idx])
        : undefined

    return this.index
      .neighbors(...position, maxResults, maxDistance, idxFilter)
      .map(idx => this.cells[idx])
  }

  generate<T>(fn: (cell: Cell<Data>) => Generator<T>): Generator<Field<T>> {
    return Generator.tuple(this.cells.map(cell => cell.generate(fn))).map(
      cells => new Field(cells, this.index.data),
    )
  }
}
