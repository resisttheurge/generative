import useCanvas from './useCanvas'

const useWebGL = (webglFn, dependencyList) =>
  useCanvas(
    canvasRef => {
      const gl = canvasRef.current.getContext('webgl')
      return webglFn(gl, ...dependencyList)
    },
    [webglFn, ...dependencyList]
  )

export default useWebGL
