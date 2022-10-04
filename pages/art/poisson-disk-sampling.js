/* global Blob */

import paper, { Point, Rectangle, Shape, Size } from 'paper'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import * as R from 'ramda'
import { saveAs } from 'file-saver'
import * as g from '../../lib/generator'
import { Layout, IconButton } from '../../components'
import { useMemo, useState } from 'react'
import { Box, Button, Field, Slider } from 'theme-ui'
import usePaper from '../../lib/usePaper'

const PDS = () => {
  const [configOpen, setConfigOpen] = useState(false)

  const [seedStr, setSeedStr] = useState('Hello world!')
  const [multiplier, setMultiplier] = useState(1)
  const [buffer, setBuffer] = useState(150)
  const [samples, setSamples] = useState(30)
  const [noiseZoom, setNoiseZoom] = useState(1200)

  const seed = g.seed(seedStr)

  const radius = (multiplier * buffer) / 2
  const offset = radius / 5 + 2

  const config = useMemo(() => (width, height) =>
    g.map(
      (config) => {
        const {
          palette: { stroke, colors },
          noises
        } = config
        const colorScale = chroma.scale(colors).domain([-1, 1])
        const noise = (x, y) => R.map(f => f(x, y), noises)
        return ({
          ...config,
          colorScale,
          noise,
          genRectangles: ([x, y]) => {
            const { vectorNoise, offsetVectorNoise, colorNoise } = noise(x, y)
            const vector = new Point(radius, 0)
            vector.angle = vectorNoise * 45 - 135
            const size = new Size(Math.abs(2 * vector.x), Math.abs(2 * vector.y))
            const framePoint = vector.add(new Point(x, y))
            const offsetVec = new Point(offset, 0)
            offsetVec.angle = offsetVectorNoise * 180
            const shadowPoint = framePoint.add(offsetVec)
            const shadow = new Shape.Rectangle(new Rectangle(shadowPoint, size))
            shadow.fillColor = colorScale(colorNoise).hex()
            const frame = new Shape.Rectangle(new Rectangle(framePoint, size))
            frame.strokeColor = stroke || '#000'
            return {
              shadow,
              frame
            }
          }
        })
      },
      g.ofShape({
        seed,
        buffer,
        samples,
        radius,
        noiseZoom,
        palette: g.chooseFrom(tome.getAll()),
        noises: {
          vectorNoise: g.simplexNoise2d({ zoom: noiseZoom * multiplier }),
          offsetVectorNoise: g.simplexNoise2d({ zoom: noiseZoom * multiplier }),
          colorNoise: g.simplexNoise2d({ zoom: noiseZoom * multiplier })
        },
        pds: g.blueNoise(g.blueNoiseLib({ samples, dimensions: [width, height], radius: multiplier * buffer }))
      })
    ), [seedStr, multiplier, buffer, samples, noiseZoom])

  const { canvasRef } = usePaper(() => {}, {
    setup: () => {
      const bounds = paper.project.view.bounds
      const { width, height } = bounds
      const [lib] = config(width, height)(seed)
      const bg = new Shape.Rectangle(
        new Rectangle(new Point(0, 0), new Size(width, height))
      )
      bg.fillColor = lib.palette.background
      for (const [x, y] of lib.pds) {
        if (x >= 0 + radius && x <= width + radius && y >= 0 + radius && y <= height - radius) {
          lib.genRectangles([x, y])
        }
      }
    },
    onResize: () => {
      const bounds = paper.project.view.bounds
      const { width, height } = bounds
      const [lib] = config(width, height)(seed)
      const bg = new Shape.Rectangle(
        new Rectangle(new Point(0, 0), new Size(width, height))
      )
      bg.fillColor = lib.palette.background
      for (const [x, y] of lib.pds) {
        if (x >= 0 + radius && x <= width + radius && y >= 0 + radius && y <= height - radius) {
          lib.genRectangles([x, y])
        }
      }
    }
  }, [seedStr, multiplier, samples, noiseZoom])

  return (
    <Layout meta={{ title: 'Poisson Disk Sampling' }}>
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
          <Field label={`Multiplier: ${multiplier}`} as={Slider} name='multiplier' min={0.05} max={1.5} step={0.05} defaultValue={multiplier} onChange={R.compose(setMultiplier, R.prop('value'), R.prop('target'))} />
          <Field label={`Buffer: ${buffer}`} as={Slider} name='buffer' min={50} max={250} defaultValue={buffer} onChange={R.compose(setBuffer, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Field label={`Samples: ${samples}`} as={Slider} name='samples' min={15} max={45} defaultValue={samples} onChange={R.compose(setSamples, Number.parseInt, R.prop('value'), R.prop('target'))} />
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

export default PDS
