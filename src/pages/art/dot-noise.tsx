/* global Blob */

import chroma from 'chroma-js'
import * as tome from 'chromotome'
import paper, { Point, Shape } from 'paper'
import { useCallback, useMemo, useState } from 'react'
import { saveAs } from 'file-saver'
import { Box, Select, Slider } from 'theme-ui'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { noise2D } from '../../lib/generators/simplex-noise'
import { PaperSetup, useGenerators, usePaper } from '../../effects'

const DotNoise = (): JSX.Element => {
  const [seed, setSeed] = useState('Blips and blops!')
  const [noiseZoom, setNoiseZoom] = useState(150)
  const { generate } = useGenerators(seed)

  const noise = useMemo(
    () => generate(noise2D({ zoom: noiseZoom })),
    [generate, noiseZoom],
  )

  const [palette, setPalette] = useState(tome.getRandom())
  const [q, setQ] = useState(5)

  const colors = chroma
    .scale(palette.colors)
    .mode('lab')
    .colors(palette.colors.length)

  const scale = chroma
    .bezier(colors.length <= 5 ? colors : chroma.scale(colors).colors(5))
    .scale()
    .mode('lab')
    .domain([-1, 1])

  const setup: PaperSetup = useCallback(
    ({ project }) => {
      const bounds = project.view.bounds
      const { width, height } = bounds
      const bg = new Shape.Rectangle(bounds)
      bg.fillColor =
        palette.background !== undefined
          ? new paper.Color(palette.background)
          : null
      const qFactor = Math.floor(width / q)
      for (let x = qFactor / 2; x < width + qFactor; x += qFactor) {
        for (let y = qFactor / 2; y < height + qFactor; y += qFactor) {
          const pos = new Point(x, y)
          const n = noise([x, y])
          const nn = Math.abs(n)
          const square = new Shape.Circle(
            pos,
            (nn * qFactor + qFactor / 2) / Math.PI,
          )
          square.fillColor = new paper.Color(scale(n).hex())
        }
      }
    },
    [palette, q, scale, noise],
  )

  const { canvasRef } = usePaper(setup)

  return (
    <Layout meta={{ title: 'Dot Noise' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob(
              [paper.project.exportSVG({ asString: true }) as string],
              { type: 'image/svg+xml;charset=utf-8' },
            )
            saveAs(data, 'Dot Noise')
          }}
        >
          <ConfigField
            label='Seed'
            name='seed'
            value={seed}
            onChange={({ target: { value } }) => setSeed(value)}
          />
          <ConfigField
            label={`Palette: ${palette.name}`}
            as={Select}
            name='palette'
            defaultValue={palette.name}
            onChange={({ target: { value } }) =>
              setPalette(tome.get(value as tome.PaletteName))
            }
          >
            {tome.getNames().map(name => (
              <option key={name}>{name}</option>
            ))}
          </ConfigField>
          <ConfigField
            label={`Noise Zoom: ${noiseZoom}`}
            as={Slider}
            name='noiseZoom'
            min={1}
            max={1200}
            defaultValue={noiseZoom}
            onChange={({ target: { value } }) =>
              setNoiseZoom(Number.parseInt(value))
            }
          />
          <ConfigField
            label={`Q: ${q}`}
            as={Slider}
            name='q'
            min={1}
            max={200}
            defaultValue={q}
            onChange={({ target: { value } }) => setQ(Number.parseInt(value))}
          />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default DotNoise
