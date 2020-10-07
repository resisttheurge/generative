import useCanvas from './useCanvas'
import paper from 'paper'

const usePaper = (paperFn, dependencyList) =>
  useCanvas(
    canvasRef => {
      paper.setup(canvasRef.current)
      paperFn(...dependencyList)
      return () => {
        paper.project.remove()
      }
    },
    [paperFn, ...dependencyList]
  )

export default usePaper
