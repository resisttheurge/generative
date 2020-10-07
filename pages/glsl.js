import { vec2 } from 'gl-matrix'

import Sketch from '../components/Sketch'
import WebGLCanvas from '../components/WebGLCanvas'
const vert = x => x
const frag = vert

const vertexShader = vert`
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`

const fragmentShader = frag`
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`

const GLSL = () => (
  <Sketch>
    <WebGLCanvas
      webglFn={gl => {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT)
        console.log(vec2(1, 2) * vec2(3, 4))
      }}
    />
  </Sketch>
)

export default GLSL
