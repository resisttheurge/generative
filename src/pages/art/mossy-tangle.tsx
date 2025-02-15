/* global Blob */

import * as tome from 'chromotome'
import * as R from 'ramda'
import { makeNoise2D } from 'open-simplex-noise'
import paper, { Point, Path } from 'paper'
import { Box, Select, Slider } from 'theme-ui'
import { saveAs } from 'file-saver'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { PaperSetup, usePaper } from '../../effects'
import { useCallback, useState } from 'react'

const calculateNoiseFlow = (
  palette: tome.Palette,
  scale: number,
  noiseZoom: number,
): ((point: paper.Point) => paper.Path) => {
  const noise = makeNoise2D(666)
  return (point: paper.Point) => {
    const path = new Path()
    path.strokeColor = new paper.Color(
      palette.colors[
        Math.round(point.x / scale + point.y / scale) % palette.size
      ] + 'ff',
    )
    path.strokeWidth = 2
    const start = point
    path.add(start)
    let curr = start
    let depth = 0
    const vector = new Point(scale, 0)
    while (paper.view.bounds.contains(curr) && depth < 1000) {
      vector.angle = noise(curr.x / noiseZoom, curr.y / noiseZoom) * 180
      const nextPoint = curr.add(vector)
      path.add(nextPoint)
      curr = nextPoint
      depth++
    }

    curr = start
    depth = 0
    while (paper.view.bounds.contains(curr) && depth < 1000) {
      vector.angle = noise(curr.x / noiseZoom, curr.y / noiseZoom) * 180 + 180
      const nextPoint = curr.add(vector)
      path.insert(0, nextPoint)
      curr = nextPoint
      depth++
    }
    path.smooth()
    path.dashArray = [scale - scale / 10, scale / 10]
    return path
  }
}

const MossyTangle: React.FC = () => {
  const [seed, setSeed] = useState('Blips and blops!')
  const [palette, setPalette] = useState(tome.get('cc242'))
  const [scale, setScale] = useState(40)
  const [noiseZoom, setNoiseZoom] = useState(200)

  const setup: PaperSetup = useCallback(
    ({ project }) => {
      const { width, height } = project.view.size
      const xs = R.map(x => x * scale, R.range(0, width / scale + 1))
      const ys = R.map(y => y * scale, R.range(0, height / scale + 1))
      const points = R.chain(x => R.map(y => new Point(x, y), ys), xs)
      const background = new Path.Rectangle(project.view.bounds)
      background.fillColor = new paper.Color(palette.background ?? '#ffffffff')
      points.forEach(calculateNoiseFlow(palette, scale, noiseZoom))
    },
    [palette, scale, noiseZoom],
  )

  const { canvasRef } = usePaper(setup)

  return (
    <Layout meta={{ title: 'Mossy Tangle' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob(
              [paper.project.exportSVG({ asString: true }) as string],
              { type: 'image/svg+xml;charset=utf-8' },
            )
            saveAs(data, 'Mossy Tangle')
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
            label={`Scale: ${scale}`}
            as={Slider}
            name='scale'
            min={20}
            max={200}
            defaultValue={scale}
            onChange={({ target: { value } }) =>
              setScale(Number.parseInt(value))
            }
          />
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
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default MossyTangle
