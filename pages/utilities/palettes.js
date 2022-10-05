/* global Blob */

import paper, { Point, Shape, Rectangle, Size } from 'paper'
import * as R from 'ramda'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import { useState } from 'react'
import { saveAs } from 'file-saver'
import { Box, Button, Field, Select } from 'theme-ui'
import { IconButton, Layout } from '../../components'
import usePaper from '../../lib/usePaper'

const Palettes = () => {
  const [configOpen, setConfigOpen] = useState(false)

  const [palette, setPalette] = useState(tome.getRandom())

  const setup = () => {
    const bounds = paper.view.bounds
    const { width, height } = bounds
    const colorWidth = colors => width / colors.length
    const colorHeight = height / 6
    const colorX = (colors, x) => x * colorWidth(colors)
    const colorY = y => y * colorHeight

    let y = 0
    let colors = chroma
      .scale(palette.colors)
      .mode('lab')
      .colors(palette.colors.length)
    const makeRectangles = (colors, y) => (color, i) => {
      const pos = new Point(colorX(colors, i), colorY(y))
      const size = new Size(colorWidth(colors), colorHeight)
      const bounds = new Rectangle(pos, size)
      const rect = new Shape.Rectangle(bounds)
      rect.fillColor = color
      return rect
    }

    colors.map(makeRectangles(colors, y++))

    // if (colors.length > 5) {
    colors = chroma.scale(colors).colors(5)
    colors.map(makeRectangles(colors, y++))
    // } else {
    //   chroma
    //     .scale(colors)
    //     .colors(5)
    //     .map(makeRectangles(chroma.scale(colors).colors(5), y++))
    // }

    const bezier = chroma.bezier(colors)
    colors = bezier
      .scale()
      .mode('lab')
      .colors(10)
    colors.map(makeRectangles(colors, y++))

    colors = bezier
      .scale()
      .mode('lab')
      .colors(20)
    colors.map(makeRectangles(colors, y++))

    colors = bezier
      .scale()
      .mode('lab')
      .correctLightness()
      .colors(10)
    colors.map(makeRectangles(colors, y++))

    colors = bezier
      .scale()
      .mode('lab')
      .correctLightness()
      .colors(20)
    colors.map(makeRectangles(colors, y++))
  }

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Palettes' }}>
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
          <Field label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </Field>
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

export default Palettes
