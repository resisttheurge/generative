import usePaper from '../lib/usePaper'
import StyledCanvas from './StyledCanvas'

const PaperCanvas = ({ paperFn }) => {
  const { canvasRef } = usePaper(paperFn, [])
  return <StyledCanvas ref={canvasRef} width='100%' height='100%' />
}

export default PaperCanvas
