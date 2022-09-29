import PaperCanvas from '../../components/PaperCanvas'
import paper, { Path, Point } from 'paper'
import { map, range, chain } from 'ramda'
import { getRandom } from 'chromotome'
// import { saveAs } from 'file-saver'

const RainbowClouds = () => (
  <PaperCanvas
    paperFn={() => {
      const { x: width, y: height } = paper.view.bounds.bottomRight
      console.log(width, height)
      const xs = map(x => Math.floor(x * 50), range(0, (width + 0) / 50))
      const ys = map(y => Math.floor(y * 50), range(0, (height + 0) / 50))
      const palette = getRandom().colors

      const circles = chain(
        x =>
          map(y => {
            const point = new Point(x, y)
            const circle = new Path.Circle(point, 50)
            circle.fillColor = palette[(x / 50 + y / 50) % palette.length]
            return [point.clone(), circle]
          }, ys),
        xs
      )

      paper.view.onFrame = event => {
        circles.forEach(([center, circle], i) => {
          const cosinus = Math.cos(event.time * 3 + i)
          const sinus = Math.sin(event.time * 3 + i)
          circle.position.x = cosinus * (width / 50) + center.x
          circle.position.y = sinus * (height / 50) + center.y
        })
      }
      paper.view.update()

      // const data = new Blob([paper.project.exportSVG({ asString: true })], {
      //   type: 'image/svg+xml;charset=utf-8'
      // })
      // saveAs(data)
    }}
  />
)

export default RainbowClouds
