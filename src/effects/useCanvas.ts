import { multiply } from 'ramda'
import {
  useCallback,
  useRef
} from 'react'
import { useResizeDetector } from 'react-resize-detector'

// Canvas hook
export const useCanvas = ({ canvasRef, scaleContext = false, onResize: externalOnResize = () => {} } = {}) => {
  const localRef = useRef(null)
  const targetRef = canvasRef || localRef
  const onResize = useCallback((width, height) => {
    const canvas = targetRef.current
    if (canvas) {
      const { devicePixelRatio = 1 } = window
      const [adjWidth, adjHeight] = [width, height].map(multiply(devicePixelRatio))
      if (canvas.width !== adjWidth || canvas.height !== adjHeight) {
        canvas.width = adjWidth
        canvas.height = adjHeight
        if (scaleContext) {
          const context = canvas.getContext('2d')
          context.scale(devicePixelRatio, devicePixelRatio)
        }
      }
    }
    externalOnResize(width, height)
  }, [targetRef, scaleContext, externalOnResize])
  useResizeDetector({ targetRef, onResize })
  return { canvasRef: targetRef }
}

export default useCanvas
