import paper from 'paper'
import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import useCanvas from './useCanvas'

type Ref<T> = React.RefObject<T>
type Project = paper.Project
type Size = paper.Size
interface OnResizeEvent { size: Size, delta: Size }
interface OnFrameEvent { count: number, time: number, delta: number }

export interface InitialContext<T = void> {
  project: Project
  state?: T
}

export interface LifecycleContext<T = void> extends InitialContext<T> {
  state: T
}

export interface OnResizeContext<T = void> extends LifecycleContext<T> {
  event: OnResizeEvent
}
export interface OnFrameEventContext<T = void> extends LifecycleContext<T> {
  event: OnFrameEvent
}

export type PaperSetup<T = void> = (context: InitialContext<T>) => T
export type PaperOnResize<T = void> = (context: OnResizeContext<T>) => T
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
  setup: PaperSetup<T>,
  {
    canvasRef: externalCanvasRef,
    onResize = setup,
    onFrame = preserveState,
    teardown = preserveState
  }: UsePaperConfig<T> = {}
): UsePaperHandle<T> {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = externalCanvasRef ?? localCanvasRef
  const projectRef = useRef<Project | null>(null)
  const stateRef = useRef<T | null>(null)

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
        state: stateRef.current ?? undefined
      })

      return () => {
        const state = stateRef.current
        invariant(state !== null, 'state should not be null')
        project.activate()
        stateRef.current = teardown({ project, state })
        project.remove()
        projectRef.current = null
      }
    }
  }, [setup, teardown])

  useEffect(() => {
    const project = projectRef.current
    if (project !== null) {
      project.view.onResize = (event: OnResizeEvent) => {
        const state = stateRef.current
        invariant(state !== null, 'state should not be null')
        project.activate()
        stateRef.current = onResize({ project, state, event })
      }
    }
  }, [onResize])

  useEffect(() => {
    const project = projectRef.current
    if (project !== null) {
      project.view.onFrame = (event: OnFrameEvent) => {
        const state = stateRef.current
        invariant(state !== null, 'state should not be null')
        project.activate()
        stateRef.current = onFrame({ project, state, event })
      }
    }
  }, [onFrame])

  return { canvasRef, projectRef, stateRef }
}

export default usePaper
