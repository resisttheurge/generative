import { multiply } from 'ramda'
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useResizeDetector } from 'react-resize-detector'

// Resize canvas to match new width & height and adjust for pixel density
const _onResize =
  (canvas, width, height) => {
    const { devicePixelRatio = 1 } = window
    const [adjWidth, adjHeight] = [width, height].map(multiply(devicePixelRatio))
    if (canvas.width !== adjWidth || canvas.height !== adjHeight) {
      const context = canvas.getContext('2d')
      canvas.width = adjHeight
      canvas.height = adjHeight
      context.scale(devicePixelRatio, devicePixelRatio)
    }
  }

// Canvas hook that includes full lifecycle API, loading indicator, and automatic resizing
const useCanvas = (draw, options = {}, deps = []) => {
  const {
    setup = canvas => {},
    preDraw = canvas => {},
    postDraw = canvas => {},
    teardown = canvas => {},
    onResize = (canvas, width, height) => {}
  } = options

  const targetRef = useRef(null)
  const [loading, setLoading] = useState(true)

  const onResizeCB = useCallback((width, height) => {
    console.log(width, height)
    _onResize(targetRef.current, width, height)
    onResize(targetRef.current, width, height)
  }, [targetRef, onResize])

  const { width, height } = useResizeDetector({ targetRef, onResize: onResizeCB })

  // onComponentDidMount hook for first resize and calling setup lifecycle function
  useEffect(() => {
    setLoading(true)
    const { width, height } = targetRef.current.getBoundingClientRect()
    _onResize(targetRef.current, width, height)
    setup(targetRef.current)
    targetRef.current.style.width = '100%'
    targetRef.current.style.height = '100%'
    setLoading(false)
    return () => {
      setLoading(true)
      teardown(targetRef.current)
      setLoading(false)
    }
  }, [width, height, setup])

  // main effect hook for interacting with window.requestAnimationFrame and calling the ...draw() lifecycle methods
  useEffect(() => {
    const canvas = targetRef.current

    let frame = 0
    let startTimeStamp
    let lastTimeStamp
    let animationFrameId

    const render = timestamp => {
      if (startTimeStamp === undefined) {
        startTimeStamp = timestamp
      }
      if (lastTimeStamp === undefined) {
        lastTimeStamp = timestamp
      }

      const elapsed = timestamp - startTimeStamp
      const delta = timestamp - lastTimeStamp
      const info = {
        frame,
        elapsed,
        delta
      }

      preDraw(canvas, info)
      draw(canvas, info)
      postDraw(canvas, info)

      lastTimeStamp = timestamp
      frame++
      animationFrameId = window.requestAnimationFrame(render)
    }

    animationFrameId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [targetRef, draw, options, ...deps])

  return { loading, width, height, canvasRef: targetRef }
}

export default useCanvas
