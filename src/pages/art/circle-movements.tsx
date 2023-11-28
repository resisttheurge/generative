/* global Blob */

import { ConfigField, ConfigMenu, Layout } from '../../components'
import { usePaper, PaperSetup, PaperOnResize, PaperOnFrame } from '../../effects'
import paper, { Point, Path } from 'paper'
import * as tome from 'chromotome'
import chroma from 'chroma-js'
import * as R from 'ramda'
import { Box, Select, Slider } from 'theme-ui'
import { useCallback, useState } from 'react'
import { Generator } from '../../lib/generators/Generator'
import { noise2D } from '../../lib/generators/simplex-noise'
import { saveAs } from 'file-saver'
import { useGenerators } from '../../effects/useGenerators'

const { constant, number, record, tuple, uniform } = Generator

interface Circle {
  id: number
  circle: paper.Path.Circle
  velocity: paper.Point
}

interface CircleMovementsState {
  circles: Circle[]
  lastId: number
  randomCircle: (id: number) => Generator<Circle>
}

const Scratch = (): JSX.Element => {
  const [seed, setSeed] = useState('Move me to move you!')
  const [palette, setPalette] = useState(tome.get('roygbiv-warm'))
  const [circleCount, setCircleCount] = useState(400)
  const [radiusFactor, setRadiusFactor] = useState(40)
  const [velocityFactor, setVelocityFactor] = useState(100)
  const [noiseZoom, setNoiseZoom] = useState(125)

  const { generate } = useGenerators(seed)

  const noise = generate(noise2D({ zoom: noiseZoom }))

  const vector = useCallback((magnitude: number, angle: number) => {
    const result = new Point(magnitude, 0)
    result.angle = angle
    return result
  }, [])

  const randomPointGen = useCallback(
    (width: number, height: number) => record({
      x: number({ min: 0, max: width }),
      y: number({ min: 0, max: height })
    }).map(({ x, y }) => new Point(x, y)),
    []
  )

  const randomVelocityGen = useCallback(
    (x: number, y: number) => record({
      magnitude: uniform,
      angle: constant(noise([x, y]) * 360)
    }).map(({ magnitude, angle }) => vector(magnitude, angle)),
    [noise, vector]
  )

  const randomCircleGen = useCallback((width: number, height: number) => (id: number) =>
    record({
      center: randomPointGen(width, height),
      radius: number({ min: 1, max: width / radiusFactor })
    }).flatMap(({ center, radius }) => {
      const circle = new Path.Circle(center, radius)
      circle.fillColor = new paper.Color(
        chroma(palette.colors[id % palette.colors.length])
          .alpha(0.5)
          .hex()
      )
      return record({
        id: constant(id),
        circle: constant(circle),
        velocity: randomVelocityGen(circle.position.x, circle.position.y)
      })
    }),
  [palette.colors, radiusFactor, randomPointGen, randomVelocityGen]
  )

  const setup: PaperSetup<CircleMovementsState> = useCallback(
    ({ project, state }) => {
      const { width, height } = project.view.bounds
      const randomCircle = randomCircleGen(width, height)

      if (state !== undefined) {
        project.activeLayer.insertChildren(0, state.circles.map(data => data.circle))
        return { ...state, randomCircle }
      } else {
        const initCircles = tuple(R.map(randomCircle, R.range(0, circleCount)))
        const circles = generate(initCircles)
        const lastId = circleCount
        return { randomCircle, circles, lastId }
      }
    },
    [circleCount, randomCircleGen, generate]
  )

  const onResize: PaperOnResize<CircleMovementsState> = useCallback(
    ({
      project: { view: { bounds: { width, height } } },
      state: { randomCircle, circles, lastId }
    }) =>
      ({
        circles,
        lastId,
        randomCircle: randomCircleGen(width, height)
      }),
    [randomCircleGen]
  )

  const onFrame: PaperOnFrame<CircleMovementsState> = useCallback(
    ({
      project: { view: { bounds } },
      state: { randomCircle, circles, lastId },
      event
    }) => {
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

  const { canvasRef } = usePaper(setup, { onResize, onFrame })

  return (
    <Layout meta={{ title: 'Circle Movements' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true }) as string], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Circle Movements')
          }}
        >
          <ConfigField label='Seed' name='seed' value={seed} onChange={({ target: { value } }) => setSeed(value)} />
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={({ target: { value } }) => setPalette(tome.get(value as tome.PaletteName))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Circle Count: ${circleCount}`} as={Slider} name='circleCount' min={100} max={1000} defaultValue={circleCount} onChange={({ target: { value } }) => setCircleCount(Number.parseInt(value))} />
          <ConfigField label={`Radius Factor: ${radiusFactor}`} as={Slider} name='radiusFactor' min={1} max={100} defaultValue={radiusFactor} onChange={({ target: { value } }) => setRadiusFactor(Number.parseInt(value))} />
          <ConfigField label={`Velocity Factor: ${velocityFactor}`} as={Slider} name='velocityFactor' min={1} max={200} defaultValue={velocityFactor} onChange={({ target: { value } }) => setVelocityFactor(Number.parseInt(value))} />
          <ConfigField label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={800} defaultValue={noiseZoom} onChange={({ target: { value } }) => setNoiseZoom(Number.parseInt(value))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Scratch
