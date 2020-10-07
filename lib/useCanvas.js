import { useEffect, useRef } from 'react'

const useCanvas = (canvasFn, dependencyList) => {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (canvasRef.current !== null) {
      const cleanupFn = canvasFn(canvasRef)
      return () => {
        if (typeof cleanupFn === 'function') {
          cleanupFn()
        }
      }
    }
  }, [canvasRef, canvasFn, ...dependencyList])
  return { canvasRef }
}

export default useCanvas
