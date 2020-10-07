import useCanvas from './useCanvas'

const useP5 = (p5fn, dependencies) =>
  useCanvas(
    canvasRef => {
      const P5 = require('p5')
      const p = new P5(p5fn, canvasRef.current)
      return () => {
        p.remove()
      }
    },
    [p5fn, ...dependencies]
  )

export default useP5
