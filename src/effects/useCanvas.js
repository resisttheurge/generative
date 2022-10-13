import { multiply } from 'ramda'
import {
  useCallback,
  useRef
} from 'react'
import { useResizeDetector } from 'react-resize-detector'

// Resize canvas to match new width & height and adjust for pixel density
const adjustCanvasDimensions =
  (canvas) => {
    if (canvas) {
      return (width, height) => {
        const { devicePixelRatio = 1 } = window
        const [adjWidth, adjHeight] = [width, height].map(multiply(devicePixelRatio))
        if (canvas.width !== adjWidth || canvas.height !== adjHeight) {
          const context = canvas.getContext('2d')
          canvas.width = adjHeight
          canvas.height = adjHeight
          context.scale(devicePixelRatio, devicePixelRatio)
        }
      }
    } else {
      return () => {}
    }
  }

// Canvas hook
export const useCanvas = () => {
  const targetRef = useRef(null)
  const onResize = useCallback(adjustCanvasDimensions(targetRef.current), [targetRef.current])
  useResizeDetector({ targetRef, onResize })
  return { canvasRef: targetRef }
}

export default useCanvas
