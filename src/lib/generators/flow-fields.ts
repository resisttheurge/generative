import { GridCell } from '../math/2d/fields/GridCell'
import { GridField } from '../math/2d/fields/GridField'
import { transform, Vector } from '../math/vectors'
import { Generator } from './Generator'

export type Flow = number

export type FieldGenerator<Data = undefined> = (
  dimensions: Vector<2>,
  resolution: number,
) => Generator<GridField<Data>>
export type FlowGenerator<F extends Flow = Flow, Data = undefined> = (
  cell: GridCell<Data>,
) => Generator<F>

export function flowGrid<F extends Flow = Flow, Data = undefined>(
  dimensions: Vector<2>,
  resolution: number,
  flowGenerator: FlowGenerator<F, Data>,
): Generator<GridField<F>> {
  return new GridField<Data>(dimensions, resolution).generate(flowGenerator)
}

export type FlowMapper<F extends Flow = Flow> = (flow: F) => Vector<2>
export const defaultFlowMapper = <F extends Flow = Flow>(
  flow: F,
): Vector<2> => [Math.cos(flow), Math.sin(flow)]

export const makePath = <F extends Flow = Flow>(
  field: GridField<F>,
  start: Vector<2>,
  stepLength = field.cellSize,
  maxSteps = 1,
  flowMapper: FlowMapper<F> = defaultFlowMapper,
): Array<Vector<2>> => {
  const result: Array<Vector<2>> = []
  let count = 0
  let position = start
  while (count++ < maxSteps && field.contains(position)) {
    result.push(position)
    const cell = field.getCell(field.toCoordinates(position))
    if (cell.hasData()) {
      const flow = cell.data
      const direction = flowMapper(flow)
      position = transform<2>(direction, stepLength, position)
    } else {
      break
    }
  }
  return result
}
