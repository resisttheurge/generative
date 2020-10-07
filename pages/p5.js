import Sketch from '../components/Sketch'
import P5Canvas from '../components/P5Canvas'

const P5 = () => (
  <Sketch>
    <P5Canvas
      p5Fn={p => {
        p.setup = () => {
          p.createCanvas(400, 400)
        }

        p.draw = () => {
          p.background(240)
        }
      }}
    />
  </Sketch>
)

export default P5
