import { Generator } from '../../../generators/Generator'
import { scale, transform, Vector } from '../../vectors'
import { Bounds } from '../bounds'
import { Cell } from './Cell'

export class GridCell<Data = undefined> extends Cell<Data> {
  readonly coordinates: Vector<2>
  readonly size: number

  constructor(coordinates: Vector<2>, size: number, data?: Data) {
    const center = transform<2>(coordinates, size, size / 2)
    const bounds: Bounds = {
      min: scale<2>(coordinates, size),
      max: transform<2>(coordinates, size, size),
    }

    super(bounds, center, data)

    this.coordinates = coordinates
    this.size = size
  }

  generate<T>(
    fn: (cell: GridCell<Data>) => Generator<T>,
  ): Generator<GridCell<T>> {
    return fn(this).map(data => new GridCell(this.coordinates, this.size, data))
  }

  inColumn(col: number): boolean {
    return this.coordinates[0] === col
  }

  inRow(row: number): boolean {
    return this.coordinates[1] === row
  }

  map<T>(fn: (cell: GridCell<Data>) => T): GridCell<T> {
    return new GridCell(this.coordinates, this.size, fn(this))
  }
}
