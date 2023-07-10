import {
  useCallback,
  useRef
} from 'react'
import { useResizeDetector } from 'react-resize-detector'

type CanvasRef = React.RefObject<HTMLCanvasElement>

export interface UseCanvasConfig {
  canvasRef?: CanvasRef
  scaleContext?: boolean
  onResize?: (width?: number, height?: number) => void
}

export interface UseCanvasHandle {
  canvasRef: CanvasRef
}

// Canvas hook
export const useCanvas = ({
  canvasRef,
  scaleContext = false,
  onResize: externalOnResize = (width?: number, height?: number) => {}
}: UseCanvasConfig = {}): UseCanvasHandle => {
  const localRef = useRef(null)
  const targetRef = canvasRef ?? localRef
  const onResize = useCallback((width?: number, height?: number) => {
    const canvas = targetRef.current
    if (canvas != null) {
      const { devicePixelRatio = 1 } = window
      const adjWidth = width === undefined ? canvas.width : width * devicePixelRatio
      const adjHeight = height === undefined ? canvas.height : height * devicePixelRatio
      if (canvas.width !== adjWidth || canvas.height !== adjHeight) {
        canvas.width = adjWidth
        canvas.height = adjHeight
        if (scaleContext) {
          const context = canvas.getContext('2d')
          context?.scale(devicePixelRatio, devicePixelRatio)
        }
      }
    }
    externalOnResize(width, height)
  }, [targetRef, scaleContext, externalOnResize])
  useResizeDetector({ targetRef, onResize })
  return { canvasRef: targetRef }
}

export default useCanvas
