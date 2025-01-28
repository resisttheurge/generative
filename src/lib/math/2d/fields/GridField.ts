import Flatbush from 'flatbush'
import { range } from 'ramda'
import invariant from 'tiny-invariant'
import { Generator } from '../../../generators/Generator'
import { map, printVector, Vector } from '../../vectors'
import { Bounds, contains, printBounds, Query } from '../bounds'
import { Cell } from './Cell'
import { Field } from './Field'
import { GridCell } from './GridCell'

interface NeighborConfig<Data = undefined> {
  maxResults?: number
  maxDistance?: number
  filter?: (cell: GridCell<Data>) => boolean
}

export interface GridCopy<Data = undefined> {
  cells: Array<GridCell<Data>>
  cellSize: number
  cols: number[]
  rows: number[]
  indexData: ArrayBuffer
}

function initGridField<Data = undefined>(
  dimensions: Vector<2>,
  resolution: number,
): GridCopy<Data> {
  const cellSize = Math.min(...dimensions) / resolution
  const [numCols, numRows] = map(dimensions, d => Math.ceil(d / cellSize))
  const [cols, rows] = [numCols, numRows].map(range(0))

  const cells: Array<GridCell<Data>> = []
  const index = new Flatbush(numCols * numRows)

  for (const col of cols) {
    for (const row of rows) {
      const cell = new GridCell<Data>([col, row], cellSize)
      index.add(...cell.bounds.min, ...cell.bounds.max)
      cells.push(cell)
    }
  }

  index.finish()

  return { cellSize, cols, rows, cells, indexData: index.data }
}

export class GridField<Data = undefined> extends Field<Data> {
  declare readonly cells: Array<GridCell<Data>>
  readonly cellSize: number
  readonly cols: number[]
  readonly rows: number[]

  constructor(
    readonly dimensions: Vector<2>,
    readonly resolution: number,
    copyData?: GridCopy<Data>,
  ) {
    const { cells, cellSize, cols, rows, indexData } =
      copyData ?? initGridField<Data>(dimensions, resolution)

    super(cells, indexData)

    this.cellSize = cellSize
    this.cols = cols
    this.rows = rows
  }

  find(
    query: Bounds | Vector<2>,
    filter?: (cell: GridCell<Data>) => boolean,
  ): GridCell<Data> | undefined {
    return super.find(
      query,
      filter as (cell: Cell<Data>) => boolean,
    ) as GridCell<Data>
  }

  findAll(
    query: Bounds | Vector<2>,
    filter?: (cell: GridCell<Data>) => boolean,
  ): Array<GridCell<Data>> {
    return super.findAll(
      query,
      filter as (cell: Cell<Data>) => boolean,
    ) as Array<GridCell<Data>>
  }

  generate<T>(
    fn: (cell: GridCell<Data>) => Generator<T>,
  ): Generator<GridField<T>> {
    return Generator.tuple(this.cells.map(cell => cell.generate(fn))).map(
      cells =>
        new GridField(this.dimensions, this.resolution, {
          cells,
          cellSize: this.cellSize,
          cols: this.cols,
          rows: this.rows,
          indexData: this.index.data,
        }),
    )
  }

  getCell([col, row]: Vector<2>): GridCell<Data> {
    return this.cells[this.toIndex([col, row])]
  }

  getColumn(col: number): Array<GridCell<Data>> {
    return this.rows.map(row => this.cells[this.toIndex([col, row])])
  }

  getRow(row: number): Array<GridCell<Data>> {
    return this.cols.map(col => this.cells[this.toIndex([col, row])])
  }

  map<T>(fn: (cell: GridCell<Data>) => T): GridField<T> {
    return new GridField(this.dimensions, this.resolution, {
      cells: this.cells.map(cell => cell.map(fn)),
      cellSize: this.cellSize,
      cols: this.cols,
      rows: this.rows,
      indexData: this.index.data,
    })
  }

  neighbors(
    query: Query,
    { maxResults, maxDistance, filter }: NeighborConfig<Data> = {},
  ): Array<GridCell<Data>> {
    return super.neighbors(query, {
      maxResults,
      maxDistance,
      filter: filter as (cell: Cell<Data>) => boolean,
    }) as Array<GridCell<Data>>
  }

  toCoordinates(position: Vector<2>): Vector<2> {
    invariant(
      contains(this.bounds, position),
      () =>
        `Given position (${printVector(position)}) is out of bounds (${printBounds(this.bounds)})`,
    )
    return map<2>(position, n => Math.floor(n / this.cellSize))
  }

  toIndex(coordinates: Vector<2>): number {
    const [col, row] = coordinates
    return row * this.cols.length + col
  }
}
