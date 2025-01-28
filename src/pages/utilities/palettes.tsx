/* global Blob */

import paper, { Point, Shape, Rectangle, Size } from 'paper'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import { useState } from 'react'
import { saveAs } from 'file-saver'
import { Box, Select } from 'theme-ui'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { PaperSetup, usePaper } from '../../effects'

const Palettes: React.FC = () => {
  const [palette, setPalette] = useState(tome.getRandom())

  const setup: PaperSetup = ({
    project: {
      view: {
        bounds: { width, height },
      },
    },
  }) => {
    const colorWidth = (colors: string[]): number => width / colors.length
    const colorHeight = height / 6
    const colorX = (colors: string[], x: number): number =>
      x * colorWidth(colors)
    const colorY = (y: number): number => y * colorHeight

    let y = 0
    let colors = chroma
      .scale(palette.colors)
      .mode('lab')
      .colors(palette.colors.length)
    const makeRectangles =
      (colors: string[], y: number) => (color: string, i: number) => {
        const pos = new Point(colorX(colors, i), colorY(y))
        const size = new Size(colorWidth(colors), colorHeight)
        const bounds = new Rectangle(pos, size)
        const rect = new Shape.Rectangle(bounds)
        rect.fillColor = new paper.Color(color)
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
    colors = bezier.scale().mode('lab').colors(10)
    colors.map(makeRectangles(colors, y++))

    colors = bezier.scale().mode('lab').colors(20)
    colors.map(makeRectangles(colors, y++))

    colors = bezier.scale().mode('lab').correctLightness().colors(10)
    colors.map(makeRectangles(colors, y++))

    colors = bezier.scale().mode('lab').correctLightness().colors(20)
    colors.map(makeRectangles(colors, y++))
  }

  const { canvasRef } = usePaper(setup)

  return (
    <Layout meta={{ title: 'Palettes' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob(
              [paper.project.exportSVG({ asString: true }) as string],
              { type: 'image/svg+xml;charset=utf-8' },
            )
            saveAs(data, 'Poisson Disk Sampling')
          }}
        >
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
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Palettes
