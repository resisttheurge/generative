export const loadShader = gl => (type, source) =>
  new Promise((resolve, reject) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      reject(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
    } else {
      resolve(shader)
    }
  })

export const initializeProgram = gl => (...shaders) =>
  new Promise((resolve, reject) => {
    const program = gl.createProgram()
    for (const shader of shaders) {
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      reject(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
    } else {
      resolve(program)
    }
  })

export const lookupProgramLocations = gl => (
  program,
  { attributes = [], uniforms = [] }
) => ({
  attributes: Object.fromEntries(
    attributes.map(attribute => [
      attribute,
      gl.getAttribLocation(program, attribute)
    ])
  ),
  uniforms: Object.fromEntries(
    uniforms.map(uniform => [uniform, gl.getUniformLocation(program, uniform)])
  )
})

export const initBuffer = gl => (
  values,
  { type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW } = {}
) => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, values, usage)
  return buffer
}

export const initBuffers = gl => ({ ...buffers }) => {
  const init = initBuffer(gl)
  return Object.fromEntries(Object.entries(buffers).map(([name, values]) => [name, init(values)]))
}
