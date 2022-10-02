import PaperCanvas from '../../components/PaperCanvas'
import { Layout } from '../../components'
import paper, { Point, Path } from 'paper'
import { makeNoise2D } from 'open-simplex-noise'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import * as r from 'ramda'

const palette = tome.get('roygbiv-warm')
const noise = makeNoise2D(Math.random())

const Scratch = () => {
  return (
    <Layout meta={{ title: 'Circle Movements' }}>
      <PaperCanvas
        paperFn={() => {
          const { width, height } = paper.view.bounds
          const randomPoint = () =>
            new Point(Math.random() * width, Math.random() * height)
          const randomVelocity = (x, y) => {
            const vector = new Point(Math.random(), 0)
            const angle = noise(x * 0.008, y * 0.008) * 180
            vector.angle = angle
            return vector
          }
          const randomCircle = id => {
            const circle = new Path.Circle(
              randomPoint(),
              (Math.random() * width) / 40
            )
            // circle.strokeColor = 'blue'
            circle.fillColor = chroma(
              palette.colors[id % palette.colors.length]
            )
              .alpha(0.5)
              .hex()
            return {
              id,
              circle,
              velocity: randomVelocity(circle.position.x, circle.position.y)
            }
          }

          let circles = r.map(randomCircle, r.range(0, 400))
          let lastId = 100
          paper.view.onFrame = event => {
            circles = r.map(data => {
              if (
                paper.view.bounds
                  .scale((width + width / 20) / width)
                  .contains(data.circle.position)
              ) {
                data.circle.position = data.circle.position.add(
                  data.velocity.multiply(event.delta * 100)
                )
                data.velocity = randomVelocity(
                  data.circle.position.x,
                  data.circle.position.y
                )
              } else {
                data.circle.remove()
                data = randomCircle(lastId++)
              }
              return data
            }, circles)
          }
        }}
      />
    </Layout>
  )
}

export default Scratch
