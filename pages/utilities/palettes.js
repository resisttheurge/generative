import paper, { Point, Shape, Rectangle, Size } from 'paper'

import * as tome from 'chromotome'
import chroma from 'chroma-js'
import { useState } from 'react'

import { Select } from 'theme-ui'
import PaperCanvas from '../components/PaperCanvas'

const paletteNames = tome.getNames()

const Palettes = () => {
  const [selectedPalette, setSelectedPalette] = useState(
    paletteNames[Math.floor(Math.random() * paletteNames.length)]
  )
  return (
    <>
      <Select
        value={selectedPalette}
        onChange={event => setSelectedPalette(event.target.value)}
      >
        {paletteNames.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <PaperCanvas
        paperFn={() => {
          const bounds = paper.view.bounds
          const { width, height } = bounds
          const palette = tome.get(selectedPalette)
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
        }}
      />
    </>
  )
}

export default Palettes
