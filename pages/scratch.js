import { useState } from 'react'
import paper from 'paper'
import * as tome from 'chromotome'
import * as r from 'ramda'
import Sketch from '../components/Sketch'

const paletteNames = tome.getNames()

const Scratch = () => {
  const [colorCount, setColorCount] = useState(3)
  const names = paletteNames.filter(
    name => tome.get(name).colors.length == colorCount
  )
  const [selectedPaletteName, setSelectedPaletteName] = useState(names[0])
  const selectedPalette = tome.get(selectedPaletteName)
  return (
    <Sketch>
      <input
        type='number'
        value={colorCount}
        onChange={event => {
          setColorCount(event.target.value)
        }}
      />
      <select
        value={selectedPaletteName}
        onChange={event => setSelectedPaletteName(event.target.value)}
      >
        {names.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </Sketch>
  )
}

export default Scratch
