/* global Blob */

import paper, { Point, Rectangle, Shape, Size } from 'paper'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import * as R from 'ramda'
import { saveAs } from 'file-saver'
import { useCallback, useState } from 'react'
import { Box, Select, Slider } from 'theme-ui'
import { Layout, ConfigMenu, ConfigField } from '../../components'
import { PaperSetup, usePaper } from '../../effects'
import { Generator } from '../../lib/generators/Generator'
import { useGenerators } from '../../effects/useGenerators'
import { noise2D } from '../../lib/generators/simplex-noise'
import { blueNoise } from '../../lib/generators/blue-noise'
import { Vector } from '../../lib/math/vectors'

const PDS: React.FC = () => {
  const [seed, setSeed] = useState('Hello world!')
  const [palette, setPalette] = useState(tome.getRandom())
  const [multiplier, setMultiplier] = useState(1)
  const [buffer, setBuffer] = useState(125)
  const [candidateLimit, setCandidateLimit] = useState(30)
  const [noiseZoom, setNoiseZoom] = useState(1200)

  const { generate } = useGenerators({ seed })

  const radius = (multiplier * buffer) / 2
  const offset = radius / 5 + 2

  const config = useCallback((width: number, height: number) =>
    Generator.record({
      noises: {
        frameNoise: noise2D({ zoom: noiseZoom * multiplier }),
        shadowNoise: noise2D({ zoom: noiseZoom * multiplier }),
        colorNoise: noise2D({ zoom: noiseZoom * multiplier })
      },
      pds: blueNoise({ dimensions: [width, height], radius: radius * 2, padding: radius * 2, candidateLimit })
    }).map(({
      noises: {
        frameNoise,
        shadowNoise,
        colorNoise
      },
      pds
    }) => {
      const colorScale = chroma.scale(palette.colors).domain([-1, 1])
      return ({
        colorScale,
        pds,
        drawRectangles: ([x, y]: Vector<2>) => {
          const { frameFactor, shadowFactor, colorFactor } = {
            frameFactor: frameNoise([x, y]),
            shadowFactor: shadowNoise([x, y]),
            colorFactor: colorNoise([x, y])
          }
          const vector = new Point(radius, 0)
          vector.angle = frameFactor * 45 - 135
          const size = new Size(Math.abs(2 * vector.x), Math.abs(2 * vector.y))
          const framePoint = vector.add(new Point(x, y))
          const offsetVec = new Point(offset, 0)
          offsetVec.angle = shadowFactor * 180
          const shadowPoint = framePoint.add(offsetVec)
          const shadow = new Shape.Rectangle(new Rectangle(shadowPoint, size))
          shadow.fillColor = new paper.Color(colorScale(colorFactor).hex())
          const frame = new Shape.Rectangle(new Rectangle(framePoint, size))
          frame.strokeColor = new paper.Color(palette.stroke ?? '#000')
          return {
            shadow,
            frame
          }
        }
      })
    }

    ), [palette, offset, radius, seed, multiplier, buffer, candidateLimit, noiseZoom])

  const setup: PaperSetup = useCallback(({ project, state }) => {
    const bounds = project.view.bounds
    const { width, height } = bounds
    const lib = generate(config(width, height))
    const bg = new Shape.Rectangle(
      new Rectangle(new Point(0, 0), new Size(width, height))
    )
    bg.fillColor = new paper.Color(palette.background ?? '#fff')
    for (const [x, y] of lib.pds) {
      lib.drawRectangles([x, y])
    }
  }, [generate, config])

  const { canvasRef } = usePaper(setup)

  return (
    <Layout meta={{ title: 'Poisson Disk Sampling' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true }) as string], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Poisson Disk Sampling')
          }}
        >
          <ConfigField label='Seed' name='seed' value={seed} onChange={R.compose(setSeed, R.prop('value'), R.prop<HTMLInputElement>('target'))} />
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop<tome.PaletteName>('value'), R.prop<HTMLSelectElement>('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Multiplier: ${multiplier}`} as={Slider} name='multiplier' min={0.05} max={1.5} step={0.05} defaultValue={multiplier} onChange={R.compose(setMultiplier, Number.parseFloat, R.prop('value'), R.prop<HTMLInputElement>('target'))} />
          <ConfigField label={`Buffer: ${buffer}`} as={Slider} name='buffer' min={50} max={250} defaultValue={buffer} onChange={R.compose(setBuffer, Number.parseInt, R.prop('value'), R.prop<HTMLInputElement>('target'))} />
          <ConfigField label={`Max Samples: ${candidateLimit}`} as={Slider} name='candidateLimit' min={15} max={45} defaultValue={candidateLimit} onChange={R.compose(setCandidateLimit, Number.parseInt, R.prop('value'), R.prop<HTMLInputElement>('target'))} />
          <ConfigField label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={1200} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop<HTMLInputElement>('target'))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default PDS
