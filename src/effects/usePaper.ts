import paper from 'paper'
import { useEffect, useRef } from 'react'
import useCanvas from './useCanvas'

type Ref<T> = React.RefObject<T>
type Project = paper.Project
interface OnFrameEvent { count: number, time: number, delta: number }

export interface LifecycleContext<T = void> {
  project: Project
  state: T
}

export interface OnFrameEventContext<T = void> extends LifecycleContext<T> {
  event: OnFrameEvent
}

export type PaperSetup<T = void> = (context: LifecycleContext<T>) => T
export type PaperOnResize<T = void> = (context: LifecycleContext<T>) => T
export type PaperOnFrame<T = void> = (context: OnFrameEventContext<T>) => T
export type PaperTeardown<T = void> = (context: LifecycleContext<T>) => T

export interface UsePaperConfig<T = void> {
  canvasRef?: Ref<HTMLCanvasElement>
  setup?: PaperSetup<T>
  onResize?: PaperOnResize<T>
  onFrame?: PaperOnFrame<T>
  teardown?: PaperTeardown<T>
}

export interface UsePaperHandle <T> {
  canvasRef: Ref<HTMLCanvasElement>
  projectRef: Ref<paper.Project>
  stateRef: Ref<T>
}

const preserveState = <T> ({ state }: { state: T }): T => state

export function usePaper <T> (
  {
    canvasRef: externalCanvasRef,
    setup = preserveState,
    onResize = preserveState,
    onFrame = preserveState,
    teardown = preserveState
  }: UsePaperConfig<T> = {},
  initState?: T
): UsePaperHandle<T> {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = externalCanvasRef ?? localCanvasRef
  const projectRef = useRef<paper.Project | null>(null)
  const stateRef = useRef<T>(initState ?? null)

  useCanvas({ canvasRef, onResize: () => {} })

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas !== null) {
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
  }, [setup, teardown])

  useEffect(() => {
    const project = projectRef.current
    if (project !== null) {
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
    if (project !== null) {
      project.view.onFrame = (event: OnFrameEvent) => {
        project.activate()
        stateRef.current = onFrame({
          project,
          event,
          state: stateRef.current
        })
      }
    }
  }, [onFrame])

  return { canvasRef, projectRef, stateRef }
}

export default usePaper
