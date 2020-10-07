import paper, { Point, Rectangle, Shape, Size } from 'paper'
import { makeNoise2D } from 'open-simplex-noise'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import Sketch from '../components/Sketch'
import PaperCanvas from '../components/PaperCanvas'
import { poissonGenerator } from '../lib/poisson'

const PDS = () => {
  const { background, colors, stroke } = tome.getRandom()
  const colorScale = chroma.scale(colors).domain([-1, 1])
  const multiplier = 1.5
  const buffer = multiplier * 100
  const samples = (12 / 100) * buffer
  const offset = buffer / 10 + 2
  const radius = buffer / 2
  const noiseZoom = 0.00125 / multiplier
  const _noises = [0, 0, 0].map(_ =>
    makeNoise2D(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
  )
  const noise = (x, y) => _noises.map(f => f(x * noiseZoom, y * noiseZoom))

  const genRectangles = ([x, y]) => {
    const [vecNoise, offsetVecNoise, colorNoise] = noise(x, y)
    const vec = new Point(radius, 0)
    vec.angle = vecNoise * 45 - 135
    const size = new Size(Math.abs(2 * vec.x), Math.abs(2 * vec.y))
    const framePoint = vec.add(new Point(x, y))
    const offsetVec = new Point(offset, 0)
    offsetVec.angle = offsetVecNoise * 180
    const shadowPoint = framePoint.add(offsetVec)
    const shadow = new Shape.Rectangle(new Rectangle(shadowPoint, size))
    shadow.fillColor = colorScale(colorNoise).hex()
    const frame = new Shape.Rectangle(new Rectangle(framePoint, size))
    frame.strokeColor = stroke || '#000'
    return {
      shadow,
      frame
    }
  }

  return (
    <Sketch>
      <PaperCanvas
        paperFn={() => {
          const bounds = paper.view.bounds
          const { width, height } = bounds
          const bg = new Shape.Rectangle(
            new Rectangle(new Point(0, 0), new Size(width, height))
          )
          bg.fillColor = background
          const { grid, queue, generator } = poissonGenerator(
            [width, height],
            buffer,
            samples,
            pos => console.log(pos, queue, grid)
          )
          for (const [x, y] of generator()) {
            genRectangles([x, y])
          }
        }}
      />
    </Sketch>
  )
}

export default PDS
