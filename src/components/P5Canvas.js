import useP5 from '../lib/useP5'
import { Box } from 'theme-ui'

const P5Canvas = ({ p5Fn, ...props }) => {
  const { canvasRef } = useP5(p5Fn, [])
  return (
    <Box
      {...props}
      ref={canvasRef}
      sx={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default P5Canvas
