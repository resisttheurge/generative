import * as R from 'ramda'
import invariant from 'tiny-invariant'
import { map } from '../combinators'
import { constant } from './constant'
import { ofShape } from './ofShape'

export const flowField = ({
  resolution,
  dimensions: { width, height },
  thetaGen = ({ center: { x, y } }) => constant(Math.atan(y / x)),
  offset: { x: minX = 0, y: minY = 0 } = {}
}) => {
  const [maxX, maxY] = [minX + width, minY + height]
  const bounds = { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
  const dimensions =
    R.map(n => Math.ceil(n / resolution), {
      cols: width,
      rows: height
    })

  const inBounds = ({ x, y }) =>
    x >= minX && y >= minY && x <= maxX && y <= maxY

  const toGridCoordinates = ({ x, y }) =>
    R.map(n => Math.floor(n / resolution), {
      col: x - minX,
      row: y - minY
    })

  const cellContaining = (field) => (position) => {
    invariant(inBounds(position), `${position} is not in bounds for field with bounds ${bounds}`)
    const { col, row } = toGridCoordinates(position)
    return field[col][row]
  }

  const generator = ofShape(R.map(col => R.map(row => {
    const min = {
      x: minX + (col * resolution),
      y: minY + (row * resolution)
    }
    const max = {
      x: Math.min(maxX, min.x + resolution),
      y: Math.min(maxY, min.y + resolution)
    }

    const cell = {
      bounds: { min, max },
      coordinates: { col, row },
      center: {
        x: min.x + ((max.x - min.x) / 2),
        y: min.y + ((max.y - min.y) / 2)
      }
    }

    return Object.assign(
      cell,
      { theta: thetaGen(cell) }
    )
  },
  R.range(0, dimensions.rows)),
  R.range(0, dimensions.cols)))

  return map(
    field =>
      Object.assign(field, {
        bounds,
        dimensions,
        resolution,
        inBounds,
        toGridCoordinates,
        cellContaining: cellContaining(field)
      }),
    generator
  )
}
