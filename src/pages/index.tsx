import { Box, Select, Slider } from 'theme-ui'
import { ConfigMenu, Layout, ConfigField } from 'components'
import {
  Canvas,
  extend,
  MaterialNode,
  useFrame,
  useThree,
} from '@react-three/fiber'
import { RefObject, useMemo, useRef, useState } from 'react'
import {
  CameraControls,
  createInstances,
  InstancedAttribute,
  shaderMaterial,
} from '@react-three/drei'
import { get, getNames, PaletteName, getAll } from 'chromotome'
import chroma from 'chroma-js'
import { Color, InstancedMesh, ShaderMaterial } from 'three'
import { useGenerators } from 'effects'
import { Generator } from '@generators/Generator'
import { noise2D } from '@generators/simplex-noise'

interface CubeAttributes {
  hColor: Color
  vColor: Color
  coords: [number, number]
}

interface CubeUniforms {
  uTime?: number
  uScale?: number
}

const [Cubes, Cube] = createInstances<CubeAttributes>()

const CubeShaderMaterial = shaderMaterial(
  { uTime: 0, uScale: 1 },
  `
  attribute vec3 vColor;
  attribute vec3 hColor;
  attribute vec2 coords;
  varying vec4 vertexColor;
  uniform float uTime;
  uniform float uScale;
  float offset = 3.1459 / 12.0;
  void main() {
    vertexColor = vec4(mix(vColor, hColor, sin(uTime + coords.x * offset + coords.y * offset) * 0.5 + 0.5), 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position + vec3(0.0, 0.0, sin(uTime + coords.x * offset * 2.0 + coords.y * offset * 2.0) * uScale), 1.0);
  }
  `,
  `
  varying vec4 vertexColor;
  void main() {
    gl_FragColor.rgba = vertexColor;
  }
  `,
)

extend({ CubeShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    cubeShaderMaterial: MaterialNode<
      ShaderMaterial & CubeUniforms,
      typeof CubeShaderMaterial
    >
  }
}

const Sketch = (): JSX.Element => {
  const [seed, setSeed] = useState('Show me everything!')
  const { generate } = useGenerators(seed)
  const [verticalPalette, setVerticalPalette] = useState(
    generate(Generator.choose(getAll())),
  )
  const [horizontalPalette, setHorizontalPalette] = useState(
    generate(Generator.choose(getAll())),
  )
  const [gridScale, setGridScale] = useState(75)

  const verticalColorScale = useMemo(
    () => chroma.scale(verticalPalette.colors),
    [verticalPalette],
  )
  const horizontalColorScale = useMemo(
    () => chroma.scale(horizontalPalette.colors),
    [horizontalPalette],
  )

  const depthNoise = generate(noise2D({ zoom: 300 }))

  const Grid = ({
    scale = gridScale,
    verticalColors = verticalColorScale,
    horizontalColors = horizontalColorScale,
  }): JSX.Element => {
    const cells: RefObject<InstancedMesh> = useRef<InstancedMesh>(null)
    const cubeMaterial = useRef<ShaderMaterial>(null!)
    const { size } = useThree()
    const { cols, rows, count, top, left } = useMemo(() => {
      const cols = Math.ceil(size.width / scale)
      const rows = Math.ceil(size.height / scale)
      const count = cols * rows
      const [bottom, right] = [(rows * scale) / 2, (cols * scale) / 2]
      const [top, left] = [-bottom, -right]
      return { cols, rows, count, top, left, bottom, right }
    }, [size, scale])

    useFrame((_, delta) => {
      if (cubeMaterial.current) {
        cubeMaterial.current.uniforms.uTime.value += delta
      }
    })

    const instances = useMemo(() => {
      return Array.from({ length: count }, (_, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const hColor = new Color().setStyle(horizontalColors(col / cols).hex())
        const vColor = new Color().setStyle(verticalColors(row / rows).hex())
        const x = left + col * scale
        const y = top + row * scale
        const position = [
          x + scale / 2,
          y + scale / 2,
          (depthNoise([x, y]) * scale) / 2,
        ] as const
        return (
          <Cube
            key={i}
            position={position}
            hColor={hColor}
            vColor={vColor}
            coords={[col, row]}
          />
        )
      })
    }, [count, horizontalColors, verticalColors, cols, rows, left, top, scale])
    return (
      <group>
        <Cubes ref={cells} args={[undefined, undefined, count]}>
          <boxGeometry args={[scale, scale, scale]} />
          <cubeShaderMaterial ref={cubeMaterial} uScale={scale} />
          <InstancedAttribute
            key={'hColor-attribute'}
            name='hColor'
            itemSize={3}
            defaultValue={[1.0, 0.0, 0.0]}
          />
          <InstancedAttribute
            key={'vColor-attribute'}
            name='vColor'
            itemSize={3}
            defaultValue={[0.0, 0.0, 1.0]}
          />
          <InstancedAttribute
            key={'coords-attribute'}
            name='coords'
            itemSize={2}
            defaultValue={[0.0, 0.0]}
          />
          {instances}
        </Cubes>
      </group>
    )
  }

  return (
    <Layout meta={{ title: 'Quilts of a Sort' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas frameloop='always' camera={{ position: [0, 0, 750] }}>
          <ambientLight intensity={Math.PI / 2} />
          <pointLight
            position={[-2000, 3000, 2000]}
            decay={0.005}
            intensity={Math.PI}
            castShadow
          />
          <CameraControls />
          <Grid scale={gridScale} />
        </Canvas>
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
        >
          <ConfigField
            label='Seed'
            name='seed'
            value={seed}
            onChange={({ target: { value } }) => setSeed(value)}
          />
          <ConfigField
            as={Select}
            label='Horizontal Palette'
            name='horizontalPalette'
            value={horizontalPalette.name}
            onChange={({ target: { value } }) =>
              setHorizontalPalette(get(value as PaletteName))
            }
          >
            {getNames().map((name, i) => (
              <option key={`h-${name}-${i}`} value={name}>
                {name}
              </option>
            ))}
          </ConfigField>
          <ConfigField
            as={Select}
            label='Vertical Palette'
            name='VerticalPalette'
            value={verticalPalette.name}
            onChange={({ target: { value } }) =>
              setVerticalPalette(get(value as PaletteName))
            }
          >
            {getNames().map((name, i) => (
              <option key={`v-${name}-${i}`} value={name}>
                {name}
              </option>
            ))}
          </ConfigField>
          <ConfigField
            as={Slider}
            label='Grid Scale'
            name='gridScale'
            min={50}
            max={200}
            value={gridScale}
            onChange={({ target: { value } }) =>
              setGridScale(Number.parseInt(value))
            }
          />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Sketch
