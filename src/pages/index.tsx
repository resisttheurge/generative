import { Box, Checkbox, Select, Slider } from 'theme-ui'

import { ConfigMenu, Layout, ConfigField } from 'components'
import { Canvas, useThree } from '@react-three/fiber'
import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CameraControls } from '@react-three/drei'
import { get, getRandom, getNames, PaletteName } from 'chromotome'
import chroma from 'chroma-js'
import { Color, InstancedMesh, Object3D } from 'three'
import { makeNoise2D, makeNoise3D } from 'open-simplex-noise'
import { Noise2D } from 'open-simplex-noise/lib/2d'
import { Noise3D } from 'open-simplex-noise/lib/3d'

const Sketch = (): JSX.Element => {
  const [verticalPalette, setVerticalPalette] = useState(getRandom())
  const [horizontalPalette, setHorizontalPalette] = useState(getRandom())
  const [gridShown, showGrid] = useState(false)
  const [gridScale, setGridScale] = useState(75)

  const verticalColorScale = useMemo(
    () => chroma.scale(verticalPalette.colors),
    [verticalPalette],
  )
  const horizontalColorScale = useMemo(
    () => chroma.scale(horizontalPalette.colors),
    [horizontalPalette],
  )

  let seed = 666
  const projectNoise =
    (noise2d: Noise2D) =>
    (noise3d: Noise3D): Noise2D => {
      return (x, y) => noise3d(x, y, noise2d(x, y))
    }
  const depthNoise = makeNoise2D(seed++)
  const projectDepth = projectNoise(depthNoise)
  const noises = {
    depth: depthNoise,
    roughness: projectDepth(makeNoise3D(seed++)),
    dispersion: projectDepth(makeNoise3D(seed++)),
    reflectivity: projectDepth(makeNoise3D(seed++)),
    iridescence: projectDepth(makeNoise3D(seed++)),
    sheen: projectDepth(makeNoise3D(seed++)),
    sheenRoughness: projectDepth(makeNoise3D(seed++)),
    clearcoat: projectDepth(makeNoise3D(seed++)),
    clearcoatRoughness: projectDepth(makeNoise3D(seed++)),
    transmission: projectDepth(makeNoise3D(seed++)),
  }
  const o = new Object3D()
  const c = new Color()

  const Grid = ({
    scale = gridScale,
    showLines = gridShown,
    verticalColors = verticalColorScale,
    horizontalColors = horizontalColorScale,
  }): JSX.Element => {
    const cells: RefObject<InstancedMesh> = useRef<InstancedMesh>(null)
    const { size } = useThree()
    const { cols, rows, count, top, left } = useMemo(() => {
      const cols = Math.ceil(size.width / scale)
      const rows = Math.ceil(size.height / scale)
      const count = cols * rows
      const [bottom, right] = [(rows * scale) / 2, (cols * scale) / 2]
      const [top, left] = [-bottom, -right]
      return { cols, rows, count, top, left, bottom, right }
    }, [size, scale])

    const coords = useCallback(
      (i: number) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = left + col * scale
        const y = top + row * scale
        return { x, y }
      },
      [left, scale, top, cols],
    )

    const noiseArray = useCallback(
      (noise: Noise2D) =>
        new Float32Array(
          Array.from({ length: count }, (_, i) => {
            const { x, y } = coords(i)
            return noise(x, y)
          }),
        ),
      [coords, count],
    )

    const colors = useMemo(
      () =>
        Array.from({ length: count }, (_, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          return c
            .set(
              chroma
                .mix(horizontalColors(col / cols), verticalColors(row / rows))
                .hex(),
            )
            .clone()
        }),
      [count, cols, rows, horizontalColors, verticalColors],
    )

    const noiseArrays = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(noises).map(([name, noise]) => [
            name,
            noiseArray(noise).map(n => (n + 1) / 2),
          ]),
        ),
      [noiseArray],
    )

    useLayoutEffect(() => {
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = left + col * scale
          const y = top + row * scale
          o.position.set(
            x + scale / 2,
            y + scale / 2,
            (depthNoise(x, y) * scale) / 2,
          )
          o.updateMatrix()
          const index = row * cols + col
          cells.current?.setMatrixAt(index, o.matrix)
          cells.current?.setColorAt(index, colors[index])
        }
      }
      if (cells.current != null) {
        cells.current.instanceMatrix.needsUpdate = true
        if (cells.current.instanceColor != null) {
          cells.current.instanceColor.needsUpdate = true
        }
      }
    }, [cols, rows, count, colors, left, scale, top])
    return (
      <group>
        <instancedMesh ref={cells} args={[undefined, undefined, count]}>
          <boxGeometry args={[scale, scale, scale]} />
          <meshPhysicalMaterial wireframe={showLines} />
          {Object.entries(noiseArrays).map(([name, array]) => (
            <instancedBufferAttribute
              key={name}
              attach={`material-${name}`}
              args={[array, 1]}
            />
          ))}
        </instancedMesh>
      </group>
    )
  }

  return (
    <Layout meta={{ title: 'Hello, World' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas frameloop='demand' camera={{ position: [0, 0, 750] }}>
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
            as={Checkbox}
            label='Show Grid'
            name='gridShown'
            checked={gridShown}
            onChange={() => showGrid(!gridShown)}
          />
          <ConfigField
            as={Slider}
            label='Grid Scale'
            name='gridScale'
            min={75}
            max={200}
            step={10}
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
