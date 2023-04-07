import fscreen from 'fscreen'
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type UseFullscreenConfig<FullscreenElementType> = { targetRef?: MutableRefObject<FullscreenElementType>}
export type UseFullscreenHandle<FullscreenElementType> = { active: boolean, enter: () => Promise<void>, exit: () => Promise<void>, node: MutableRefObject<FullscreenElementType>}

export function useFullscreen<T>({ targetRef: externalRef }: UseFullscreenConfig<T> = {}): UseFullscreenHandle<T> {
  const localRef = useRef(null as T)
  const targetRef = externalRef || localRef

  const [fullscreenActive, setFullscreenActive] = useState(false)

  const onFullscreenChange = useCallback(() => {
    setFullscreenActive(fscreen.fullscreenElement && fscreen.fullscreenElement === targetRef.current)
  }, [targetRef])

  useEffect(() => {
    fscreen.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      fscreen.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [onFullscreenChange])

  const enterFullscreen = useCallback(() => (
    targetRef.current
      ? fscreen.fullscreenElement
          ? fscreen.fullscreenElement !== targetRef.current
              ? fscreen.exitFullscreen()
                  .then(() =>
                    targetRef.current
                      ? fscreen.requestFullscreen(targetRef.current)
                      : Promise.reject(new Error('The ref for which a fullscreen request was made no longer exists'))
                  )
              : Promise.resolve()
          : fscreen.requestFullscreen(targetRef.current)
      : Promise.reject(new Error('The ref for which a fullscreen request was made does not exist.'))
  ), [targetRef])

  const exitFullscreen = useCallback(() => (
    targetRef.current
      ? fscreen.fullscreenElement && fscreen.fullscreenElement === targetRef.current
          ? fscreen.exitFullscreen()
          : Promise.resolve()
      : Promise.reject(new Error('The ref for which an exitFullscreen request was made does not exist.'))

  ), [targetRef])

  return useMemo(() => ({
    active: fullscreenActive,
    enter: enterFullscreen,
    exit: exitFullscreen,
    node: targetRef
  }), [
    fullscreenActive,
    enterFullscreen,
    exitFullscreen,
    targetRef
  ])
}
