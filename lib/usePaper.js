import useCanvas from './useCanvas'
import paper from 'paper'
import { useRef } from 'react'

const usePaper = (draw, options = {}) => {
  const {
    setup = canvas => {},
    preDraw = canvas => {},
    postDraw = canvas => {},
    teardown = canvas => {},
    onResize = (canvas, width, height) => {}
  } = options

  const projectRef = useRef(null)

  return useCanvas(
    draw,
    {
      onResize,
      setup: canvas => {
        paper.setup(canvas)
        projectRef.current = paper.project
        projectRef.current.activate()
        setup(canvas)
      },
      preDraw: canvas => {
        projectRef.current.activate()
        preDraw()
      },
      postDraw: canvas => {
        projectRef.current.activate()
        postDraw()
      },
      teardown: canvas => {
        teardown(canvas)
        projectRef.current.remove()
      }
    }
  )
}

export default usePaper
