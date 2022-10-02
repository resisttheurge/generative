import chroma from 'chroma-js'
import * as tome from 'chromotome'
import { makeNoise2D } from 'open-simplex-noise'
import paper, { Point, Shape } from 'paper'
import { Layout } from '../../components'
import PaperCanvas from '../../components/PaperCanvas'

const DotNoise = () => {
  const palette = tome.getRandom()
  console.log(palette.name)
  const colors = chroma
    .scale(palette.colors)
    .mode('lab')
    .colors(palette.colors.length)
  const scale = chroma
    .bezier(colors.length <= 5 ? colors : chroma.scale(colors).colors(5))
    .scale()
    .mode('lab')
    .domain([-1, 1])

  const background = palette.background
  const noise = makeNoise2D(666)
  const noiseScale = 0.01

  return (
    <Layout meta={{ title: 'Dot Noise' }}>
      <PaperCanvas
        paperFn={() => {
          const bounds = paper.view.bounds
          const { width, height } = bounds
          const q = 0.1 / noiseScale
          const bg = new Shape.Rectangle(bounds)
          bg.fillColor = background

          for (let x = q / 2; x < width + q; x += q) {
            for (let y = q / 2; y < height + q; y += q) {
              const pos = new Point(x, y)
              const n = noise(x * noiseScale, y * noiseScale)
              const nn = Math.abs(n)
              const square = new Shape.Circle(pos, (nn * q + q / 2) / Math.PI)
              square.fillColor = scale(n).name()
            }
          }

          paper.view.onResize = event => {
            console.log(event)
          }
        }}
      />
    </Layout>
  )
}

export default DotNoise
