/* global Blob */

import chroma from 'chroma-js'
import * as tome from 'chromotome'
import paper, { Point, Shape } from 'paper'
import { useCallback, useState } from 'react'
import * as R from 'ramda'
import { saveAs } from 'file-saver'
import { Box, Select, Slider } from 'theme-ui'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { chooseFrom, ofShape, seed, simplexNoise2d } from '../../lib/generator'
import { useGenerators, usePaper } from '../../effects'

const DotNoise = () => {
  const [seed, setSeed] = useState('Blips and blops!')
  const [noiseZoom, setNoiseZoom] = useState(150)
  const { generate } = useGenerators({ seed })

  const { initPalette, noise } = generate(ofShape({
    initPalette: chooseFrom(tome.getAll()),
    noise: simplexNoise2d({ zoom: noiseZoom })
  }))

  const [palette, setPalette] = useState(initPalette)
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

  const setup = useCallback(({ project }) => {
    const bounds = project.view.bounds
    const { width, height } = bounds
    const bg = new Shape.Rectangle(bounds)
    bg.fillColor = palette.background
    const qFactor = Math.floor(width / q)
    for (let x = qFactor / 2; x < width + qFactor; x += qFactor) {
      for (let y = qFactor / 2; y < height + qFactor; y += qFactor) {
        const pos = new Point(x, y)
        const n = noise(x, y)
        const nn = Math.abs(n)
        const square = new Shape.Circle(pos, (nn * qFactor + qFactor / 2) / Math.PI)
        square.fillColor = scale(n).hex()
      }
    }
  }, [palette, q, scale, noise])

  const onResize = setup

  const { canvasRef } = usePaper({ setup, onResize })

  return (
    <Layout meta={{ title: 'Dot Noise' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={event => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Dot Noise')
          }}
        >
          <ConfigField label='Seed' name='seed' value={seed} onChange={R.compose(setSeed, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={1200} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Q: ${q}`} as={Slider} name='q' min={1} max={200} defaultValue={q} onChange={R.compose(setQ, Number.parseInt, R.prop('value'), R.prop('target'))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default DotNoise
