/* global Blob */

import { IconButton, Layout } from '../../components'
import usePaper from '../../lib/usePaper'
import paper, { Point, Path } from 'paper'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import * as R from 'ramda'
import { Box, Button, Field, Select, Slider } from 'theme-ui'
import { useRef, useState } from 'react'
import { constant, flatMap, map, number, record, seed, simplexNoise2d, tuple, uniform } from '../../lib/generator'
import { saveAs } from 'file-saver'

const Scratch = () => {
  const [configOpen, setConfigOpen] = useState(false)
  const [seedStr, setSeedStr] = useState('Move me to move you!')
  const [palette, setPalette] = useState(tome.get('roygbiv-warm'))
  const [circleCount, setCircleCount] = useState(400)
  const [radiusFactor, setRadiusFactor] = useState(40)
  const [velocityFactor, setVelocityFactor] = useState(100)
  const [noiseZoom, setNoiseZoom] = useState(125)

  const [noise, initSeed] = simplexNoise2d({ zoom: noiseZoom })(seed(seedStr))

  const seedRef = useRef(initSeed)

  const vector = (magnitude, angle) => {
    const result = new Point(magnitude, 0)
    result.angle = angle
    return result
  }

  const randomPointGen = (width, height) =>
    map(
      ({ x, y }) => new Point(x, y),
      record({
        x: number({ min: 0, max: width }),
        y: number({ min: 0, max: height })
      })
    )

  const randomVelocityGen = (x, y) =>
    map(
      ({ magnitude, angle }) => vector(magnitude, angle),
      record({
        magnitude: uniform,
        angle: constant(noise(x, y) * 360)
      })
    )

  const randomCircleGen = (width, height) => (id) =>
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
    )

  const setup = () => {
    const { width, height } = paper.view.bounds
    const randomCircle = randomCircleGen(width, height)
    const initCircles = tuple(R.map(randomCircle, R.range(0, circleCount)))

    let [circles, initCirclesSeed] = initCircles(seedRef.current)
    seedRef.current = initCirclesSeed

    let lastId = circleCount

    paper.view.onFrame = event => {
      circles = R.map(data => {
        if (
          paper.view.bounds
            .scale((width + width / (radiusFactor / 2)) / width)
            .contains(data.circle.position)
        ) {
          data.circle.position = data.circle.position.add(
            data.velocity.multiply(event.delta * velocityFactor)
          )
          const [newVelocity, newVelocitySeed] = randomVelocityGen(
            data.circle.position.x,
            data.circle.position.y
          )(seedRef.current)
          data.velocity = newVelocity
          seedRef.current = newVelocitySeed
        } else {
          data.circle.remove()
          const [newCircle, newCircleSeed] = randomCircle(lastId++)(seedRef.current)
          data = newCircle
          seedRef.current = newCircleSeed
        }
        return data
      }, circles)
    }
  }

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Circle Movements' }}>
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
          <Field label={`Circle Count: ${circleCount}`} as={Slider} name='noiseZoom' min={100} max={1000} defaultValue={circleCount} onChange={R.compose(setCircleCount, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Field label={`Radius Factor: ${radiusFactor}`} as={Slider} name='noiseZoom' min={1} max={100} defaultValue={radiusFactor} onChange={R.compose(setRadiusFactor, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Field label={`Velocity Factor: ${velocityFactor}`} as={Slider} name='noiseZoom' min={1} max={200} defaultValue={velocityFactor} onChange={R.compose(setVelocityFactor, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Field label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={800} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <Button
            variant='primary'
            sx={{
              justifySelf: 'stretch'
            }}
            onClick={() => {
              const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
              saveAs(data, 'Circle Movements')
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

export default Scratch
