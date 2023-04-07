/* global Blob */

import { ConfigField, ConfigMenu, IconButton, Layout } from '../../components'
import { usePaper } from '../../effects'
import paper, { Point, Path } from 'paper'
import * as tome from 'chromotome'
import chroma, { random } from 'chroma-js'
import * as R from 'ramda'
import { Box, Button, Field, Select, Slider } from 'theme-ui'
import { useCallback, useMemo, useRef, useState } from 'react'
import { constant, flatMap, map, number, record, seed, simplexNoise2d, tuple, uniform } from '../../lib/generator'
import { saveAs } from 'file-saver'
import { useGenerators } from '../../effects/useGenerators'

const Scratch = () => {
  const [seedStr, setSeedStr] = useState('Move me to move you!')
  const [palette, setPalette] = useState(tome.get('roygbiv-warm'))
  const [circleCount, setCircleCount] = useState(400)
  const [radiusFactor, setRadiusFactor] = useState(40)
  const [velocityFactor, setVelocityFactor] = useState(100)
  const [noiseZoom, setNoiseZoom] = useState(125)

  const { generate } = useGenerators({ seed: seedStr })

  const noise = generate(simplexNoise2d({ zoom: noiseZoom }))

  const vector = useCallback((magnitude, angle) => {
    const result = new Point(magnitude, 0)
    result.angle = angle
    return result
  }, [])

  const randomPointGen = useCallback((width, height) =>
    map(
      ({ x, y }) => new Point(x, y),
      record({
        x: number({ min: 0, max: width }),
        y: number({ min: 0, max: height })
      })
    ), [])

  const randomVelocityGen = useCallback((x, y) =>
    map(
      ({ magnitude, angle }) => vector(magnitude, angle),
      record({
        magnitude: uniform,
        angle: constant(noise(x, y) * 360)
      })
    ), [noise, vector])

  const randomCircleGen = useCallback((width, height) => (id) =>
    flatMap(
      ({ center, radius }) => {
        const circle = new Path.Circle(center, radius)
        circle.fillColor = chroma(
          palette.colors[id % palette.colors.length]
        )
          .alpha(0.5)
          .hex()
        return record({
          id: constant(id),
          circle: constant(circle),
          velocity: randomVelocityGen(circle.position.x, circle.position.y)
        })
      },
      record({
        center: randomPointGen(width, height),
        radius: number({ min: 1, max: width / radiusFactor })
      })
    ), [palette.colors, radiusFactor, randomPointGen, randomVelocityGen])

  const setup = useCallback(({ project, state }) => {
    const { width, height } = project.view.bounds
    const randomCircle = randomCircleGen(width, height)

    if (state) {
      project.activeLayer.insertChildren(0, state.circles.map(data => data.circle))
      return { ...state, randomCircle }
    } else {
      const initCircles = tuple(R.map(randomCircle, R.range(0, circleCount)))
      const circles = generate(initCircles)
      const lastId = circleCount
      return { randomCircle, circles, lastId }
    }
  }, [circleCount, randomCircleGen, generate])

  const onResize = useCallback(({ project: { view: { bounds: { width, height } } }, state: { randomCircle, circles, lastId } }) => ({
    circles,
    lastId,
    randomCircle: randomCircleGen(width, height)
  }), [randomCircleGen])

  const onFrame = useCallback(({ project: { view: { bounds } }, event, state: { randomCircle, circles, lastId } }) => {
    const { width } = bounds
    circles = R.map(data => {
      if (
        bounds
          .scale((width + width / (radiusFactor / 2)) / width)
          .contains(data.circle.position)
      ) {
        data.circle.position = data.circle.position.add(
          data.velocity.multiply(event.delta * velocityFactor)
        )
        data.velocity = generate(randomVelocityGen(
          data.circle.position.x,
          data.circle.position.y
        ))
      } else {
        data.circle.remove()
        data = generate(randomCircle(lastId++))
      }
      return data
    }, circles)
    return { randomCircle, circles, lastId }
  }, [radiusFactor, randomVelocityGen, velocityFactor, generate])

  const { canvasRef } = usePaper({ setup, onResize, onFrame })

  return (
    <Layout meta={{ title: 'Circle Movements' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={event => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Circle Movements')
          }}
        >
          <ConfigField label='Seed' name='seed' value={seedStr} onChange={R.compose(setSeedStr, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Circle Count: ${circleCount}`} as={Slider} name='noiseZoom' min={100} max={1000} defaultValue={circleCount} onChange={R.compose(setCircleCount, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Radius Factor: ${radiusFactor}`} as={Slider} name='noiseZoom' min={1} max={100} defaultValue={radiusFactor} onChange={R.compose(setRadiusFactor, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Velocity Factor: ${velocityFactor}`} as={Slider} name='noiseZoom' min={1} max={200} defaultValue={velocityFactor} onChange={R.compose(setVelocityFactor, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={800} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Scratch
