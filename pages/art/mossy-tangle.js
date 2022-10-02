import PaperCanvas from '../../components/PaperCanvas'
import * as tome from 'chromotome'
import * as r from 'ramda'
import { makeNoise2D } from 'open-simplex-noise'
import paper, { Point, Path } from 'paper'
import { Layout } from '../../components'

const calculateNoiseFlow = (palette, scale, noiseScale) => {
  const noise = makeNoise2D(666)
  return point => {
    const path = new Path()
    path.strokeColor =
      palette[Math.round(point.x / scale + point.y / scale) % palette.length] +
      'ff'
    path.strokeWidth = 2
    const start = point
    path.add(start)
    let curr = start
    let depth = 0
    const vector = new Point(scale, 0)
    while (paper.view.bounds.contains(curr) && depth < 1000) {
      vector.angle = noise(curr.x * noiseScale, curr.y * noiseScale) * 180
      const nextPoint = curr.add(vector)
      path.add(nextPoint)
      curr = nextPoint
      depth++
    }

    curr = start
    depth = 0
    while (paper.view.bounds.contains(curr) && depth < 1000) {
      vector.angle = noise(curr.x * noiseScale, curr.y * noiseScale) * 180 + 180
      const nextPoint = curr.add(vector)
      path.insert(0, nextPoint)
      curr = nextPoint
      depth++
    }
    path.smooth()
    path.dashArray = [scale - scale / 10, scale / 10]
  }
}

const MossyTangle = () => (
  <Layout meta={{ title: 'Mossy Tangle' }}>
    <PaperCanvas
      paperFn={() => {
        const { width, height } = paper.view.size
        const scale = 40
        const noiseScale = 0.005
        const xs = r.map(x => x * scale, r.range(0, width / scale + 1))
        const ys = r.map(y => y * scale, r.range(0, height / scale + 1))
        const points = r.chain(x => r.map(y => new Point(x, y), ys), xs)
        const palette = tome.get('cc242')
        const background = new Path.Rectangle(paper.view.bounds)
        background.fillColor = palette.background || 0xffffffff
        points.forEach(calculateNoiseFlow(palette.colors, scale, noiseScale))
      // const vectors = points.map(point => {
      //   const nextPoint = point.clone()
      //   nextPoint.x = nextPoint.x + scale
      //   const vector = nextPoint.subtract(point)
      //   const value = noise(point.x * noiseScale, point.y * noiseScale)
      //   vector.angle = value * 180
      //   const path = new Path()
      //   path.strokeColor = 'black'
      //   path.strokeWidth = value + 1
      //   path.strokeCap = 'round'
      //   path.add(point)
      //   path.add(point.add(vector))
      //   return path
      // })
      }}
    />
  </Layout>
)

export default MossyTangle
