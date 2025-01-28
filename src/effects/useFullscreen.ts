import fscreen from 'fscreen'
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export interface UseFullscreenConfig<T extends Element> {
  targetRef?: MutableRefObject<T>
}
export interface UseFullscreenHandle<T extends Element> {
  active: boolean
  enter: () => Promise<void>
  exit: () => Promise<void>
  node: MutableRefObject<T | null>
}

export function useFullscreen<T extends Element>({
  targetRef: externalRef,
}: UseFullscreenConfig<T> = {}): UseFullscreenHandle<T> {
  const localRef = useRef(null)
  const targetRef = externalRef != null ? externalRef : localRef

  const [fullscreenActive, setFullscreenActive] = useState(false)

  const onFullscreenChange = useCallback(() => {
    setFullscreenActive(fscreen.fullscreenElement === targetRef.current)
  }, [targetRef])

  useEffect(() => {
    fscreen.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      fscreen.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [onFullscreenChange])

  const enterFullscreen = useCallback(
    async () =>
      targetRef.current != null
        ? fscreen.fullscreenElement != null
          ? fscreen.fullscreenElement !== targetRef.current
            ? await fscreen
                .exitFullscreen()
                .then(async () =>
                  targetRef.current != null
                    ? await fscreen.requestFullscreen(targetRef.current)
                    : await Promise.reject(
                        new Error(
                          'The ref for which a fullscreen request was made no longer exists',
                        ),
                      ),
                )
            : await Promise.resolve()
          : await fscreen.requestFullscreen(targetRef.current)
        : await Promise.reject(
            new Error(
              'The ref for which a fullscreen request was made does not exist.',
            ),
          ),
    [targetRef],
  )

  const exitFullscreen = useCallback(
    async () =>
      targetRef.current != null
        ? fscreen.fullscreenElement != null &&
          fscreen.fullscreenElement === targetRef.current
          ? await fscreen.exitFullscreen()
          : await Promise.resolve()
        : await Promise.reject(
            new Error(
              'The ref for which an exitFullscreen request was made does not exist.',
            ),
          ),
    [targetRef],
  )

  return useMemo(
    () => ({
      active: fullscreenActive,
      enter: enterFullscreen,
      exit: exitFullscreen,
      node: targetRef,
    }),
    [fullscreenActive, enterFullscreen, exitFullscreen, targetRef],
  )
}
