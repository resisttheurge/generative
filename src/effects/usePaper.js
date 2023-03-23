import paper from 'paper'
import { useCallback, useEffect, useRef } from 'react'
import useCanvas from './useCanvas'

export const usePaper = ({
  canvasRef: externalCanvasRef,
  initState,
  setup = ({ project, view, state }) => state,
  onResize = ({ project, view, state }) => state,
  onFrame = ({ project, view, state, event }) => state,
  teardown = ({ project, view, state }) => state
} = {}) => {
  const localCanvasRef = useRef(null)
  const canvasRef = externalCanvasRef || localCanvasRef
  const stateRef = useRef(initState)
  const projectRef = useRef(null)

  useCanvas({ canvasRef, onResize: () => {} })

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      paper.setup(canvas)

      canvas.style.width = '100%'
      canvas.style.height = '100%'

      const { project } = paper
      projectRef.current = project
      project.activate()
      stateRef.current = setup({
        project,
        state: stateRef.current
      })

      return () => {
        project.activate()
        stateRef.current = teardown({ project, state: stateRef.current })
        project.remove()
        projectRef.current = null
      }
    }
  }, [canvasRef, setup, teardown])

  useEffect(() => {
    const project = projectRef.current
    if (project) {
      project.view.onResize = () => {
        project.activate()
        stateRef.current = onResize({
          project,
          state: stateRef.current
        })
      }
    }
  }, [onResize])

  useEffect(() => {
    const project = projectRef.current
    if (project) {
      project.view.onFrame = event => {
        project.activate()
        stateRef.current = onFrame({
          project,
          event,
          state: stateRef.current
        })
      }
    }
  }, [onFrame])

  return { canvasRef, stateRef, projectRef }
}

export default usePaper
