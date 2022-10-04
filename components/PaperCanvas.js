import usePaper from '../lib/usePaper'

export const PaperCanvas = ({ paperFn, ...props }) => {
  const { canvasRef } = usePaper(paperFn)
  return (
    <canvas
      {...props}
      ref={canvasRef}
      sx={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default PaperCanvas
