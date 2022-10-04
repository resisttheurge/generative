import chroma from 'chroma-js'
import * as tome from 'chromotome'
import paper, { Point, Shape } from 'paper'
import { useMemo, useState } from 'react'
import * as R from 'ramda'
import { saveAs } from 'file-saver'
import { Box, Button, Field, Select, Slider } from 'theme-ui'
import { IconButton, Layout } from '../../components'
import { chooseFrom, ofShape, seed, simplexNoise2d } from '../../lib/generator'
import usePaper from '../../lib/usePaper'

const DotNoise = () => {
  const [configOpen, setConfigOpen] = useState(false)

  const [seedStr, setSeedStr] = useState('Hello world!')
  const [noiseZoom, setNoiseZoom] = useState(1200)

  const [{ initPalette, noise }] = ofShape({
    initPalette: chooseFrom(tome.getAll()),
    noise: simplexNoise2d({ zoom: noiseZoom })
  })(seed(seedStr))

  const [palette, setPalette] = useState(initPalette)

  const colors = chroma
    .scale(palette.colors)
    .mode('lab')
    .colors(palette.colors.length)

  const scale = chroma
    .bezier(colors.length <= 5 ? colors : chroma.scale(colors).colors(5))
    .scale()
    .mode('lab')
    .domain([-1, 1])

  const background = palette.background

  const setup = () => {
    const bounds = paper.view.bounds
    const { width, height } = bounds
    const q = 0.1 * noiseZoom
    const bg = new Shape.Rectangle(bounds)
    bg.fillColor = background

    for (let x = q / 2; x < width + q; x += q) {
      for (let y = q / 2; y < height + q; y += q) {
        const pos = new Point(x, y)
        const n = noise(x, y)
        const nn = Math.abs(n)
        const square = new Shape.Circle(pos, (nn * q + q / 2) / Math.PI)
        square.fillColor = scale(n).name()
      }
    }
  }

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Dot Noise' }}>
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
          <Field label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={1200} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Button
            variant='primary'
            sx={{
              justifySelf: 'stretch'
            }}
            onClick={() => {
              const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
              saveAs(data, 'Dot Noise')
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

export default DotNoise
