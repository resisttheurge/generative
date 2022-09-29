import useWebGL from '../lib/useWebGL'

export const WebGLCanvas = ({ webglFn, ...props }) => {
  const { canvasRef } = useWebGL(webglFn, [])
  return (
    <canvas
      {...props}
      ref={canvasRef}
      sx={{
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default WebGLCanvas
