import useP5 from '../lib/useP5'
import { StyledDiv } from './StyledCanvas'

const P5Canvas = ({ p5Fn }) => {
  const { canvasRef } = useP5(p5Fn, [])
  return <StyledDiv ref={canvasRef} width='100%' height='100%' />
}

export default P5Canvas
