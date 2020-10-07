import StyledCanvas from './StyledCanvas'
import useWebGL from '../lib/useWebGL'

const WebGLCanvas = ({ webglFn }) => {
  const { canvasRef } = useWebGL(webglFn, [])
  return <StyledCanvas ref={canvasRef} width='100%' height='100%' />
}

export default WebGLCanvas
