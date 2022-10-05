/* global Blob */

import * as tome from 'chromotome'
import * as R from 'ramda'
import { makeNoise2D } from 'open-simplex-noise'
import paper, { Point, Path } from 'paper'
import { Box, Button, Field, Select, Slider } from 'theme-ui'
import { saveAs } from 'file-saver'
import { IconButton, Layout } from '../../components'
import usePaper from '../../lib/usePaper'
import { useMemo, useState } from 'react'

const calculateNoiseFlow = (palette, scale, noiseZoom) => {
  const noise = makeNoise2D(666)
  return point => {
    const path = new Path()
    path.strokeColor =
      palette[Math.round(point.x / scale + point.y / scale) % palette.length] +
      'ff'
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
  }
}

const MossyTangle = () => {
  const [configOpen, setConfigOpen] = useState(false)
  const [seedStr, setSeedStr] = useState('Blips and blops!')
  const [palette, setPalette] = useState(tome.get('cc242'))
  const [scale, setScale] = useState(40)
  const [noiseZoom, setNoiseZoom] = useState(200)

  const setup = useMemo(() => () => {
    const { width, height } = paper.view.size
    const xs = R.map(x => x * scale, R.range(0, width / scale + 1))
    const ys = R.map(y => y * scale, R.range(0, height / scale + 1))
    const points = R.chain(x => R.map(y => new Point(x, y), ys), xs)
    const background = new Path.Rectangle(paper.view.bounds)
    background.fillColor = palette.background || 0xffffffff
    points.forEach(calculateNoiseFlow(palette.colors, scale, noiseZoom))
  }, [seedStr, palette, scale, noiseZoom])

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Mossy Tangle' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <Box
          as='form'
          sx={{
            variant: 'forms.form',
            top: 0,
            right: 0,
            position: 'absolute',
            opacity: configOpen ? 1 : 0,
            transition: 'opacity .25s ease-in-out'

          }}
          onSubmit={event => event.preventDefault()}
        >
          <Field label='Seed' name='seed' value={seedStr} onChange={R.compose(setSeedStr, R.prop('value'), R.prop('target'))} />
          <Field label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </Field>
          <Field label={`Scale: ${scale}`} as={Slider} name='scale' min={20} max={200} defaultValue={scale} onChange={R.compose(setScale, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Field label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={1200} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Button
            variant='primary'
            sx={{
              justifySelf: 'stretch'
            }}
            onClick={() => {
              const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
              saveAs(data, 'Poisson Disk Sampling')
            }}
          >
            Save SVG
          </Button>
        </Box>
        <IconButton
          icon='gear'
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            opacity: 1
          }}
          onClick={() => setConfigOpen(!configOpen)}
        />
      </Box>
    </Layout>
  )
}

export default MossyTangle
