/* global Blob */

import * as tome from 'chromotome'
import paper, { Point, Path } from 'paper'
import { blueNoise, number, chooseFrom, int, bool, simplexNoise2d, flatMap, record, repeat, ofShape, map, flowField, constant } from '../../lib/generator'
import * as R from 'ramda'
import { useCallback, useMemo, useState } from 'react'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { Box, Checkbox, Select, Slider, useThemeUI } from 'theme-ui'
import { useGenerators, usePaper } from '../../effects'
import { saveAs } from 'file-saver'
import { Shape } from 'paper/dist/paper-core'

const drawCurve = (field, start, stepLength = field.resolution, numSteps = 1) => {
  const curve = new Path()
  curve.moveTo(start)
  let cur = start
  for (let n = 0; n < numSteps; n++) {
    if (field.inBounds(cur)) {
      const { theta } = field.cellContaining(cur)
      const vector = new Point(stepLength, 0)
      vector.angleInRadians = theta
      cur = cur.add(vector)
      curve.lineTo(cur)
    } else {
      break
    }
  }
  return curve
}

const Grids = () => {
  const [seed, setSeed] = useState('Big and')
  const [palette, setPalette] = useState(tome.getRandom())
  const [resolutionFactor, setResolutionFactor] = useState(5)
  const [density, setDensity] = useState(100)
  const [noiseZoom, setNoiseZoom] = useState(100)
  const [minSegments, setMinSegments] = useState(2)
  const [maxSegments, setMaxSegments] = useState(30)
  const [shouldDrawGrid, setShouldDrawGrid] = useState(false)
  const [gridOnTop, setGridOnTop] = useState(false)
  const { generate } = useGenerators({ seed })
  const { theme } = useThemeUI()
  const backgroundColor = useMemo(() => palette.background || theme.rawColors.background, [palette, theme])

  const resolution = useCallback(({ width, height }) => Math.max(width, height) / resolutionFactor, [resolutionFactor])

  const drawGrid = useCallback((field) => {
    const grid = []
    for (const col of field) {
      const column = []
      for (const { center, bounds: { min, max }, theta } of col) {
        const [width, height] = [max.x - min.x, max.y - min.y]
        const background = new Path.Rectangle(min, { width, height })
        background.fillColor = theme.rawColors.background
        background.strokeColor = theme.rawColors.text
        const point = new Point(Math.max(width, height) / 2, 0)
        point.angleInRadians = theta
        const arrow = new Path(center, point.add(center))
        arrow.strokeColor = theme.rawColors.text
        column.push({
          background,
          arrow
        })
      }
      grid.push(column)
    }
  }, [theme])

  const genDashArray = useCallback((segmentLength) => flatMap(
    numDashPairs => repeat(numDashPairs * 2, number({ min: 0, max: segmentLength })),
    int({ min: 0, max: 0 })
  ), [])

  const genSafeStrokeColor = useMemo(() => chooseFrom(
    palette.colors
      .filter(color => color !== backgroundColor)
  ), [palette, backgroundColor])

  const genCurveProps = useCallback((size) => flatMap(
    segmentLength => ofShape({
      segmentLength,
      miterLimit: map(factor => segmentLength / factor, number({ min: 1, max: 4 })),
      numSegments: int({ min: minSegments, max: maxSegments }),
      strokeColor: genSafeStrokeColor,
      opacity: number({ min: 0.1, max: 1 }),
      strokeWidth: int({ min: 1, max: resolution(size) }),
      strokeCap: chooseFrom(['butt', 'round', 'square']),
      strokeJoin: chooseFrom(['miter', 'round', 'bevel']),
      smooth: bool(),
      simplify: bool(),
      dashArray: flatMap(dashArray => dashArray ? genDashArray(segmentLength) : constant([]), bool())
    }),
    map(factor => resolution(size) / factor, number({ min: 1, max: 4 }))
  ), [minSegments, maxSegments, resolution, genDashArray, genSafeStrokeColor])

  const genGlobalCurveSwitches = useMemo(() => record({
    segmentLengthPerCurve: bool(),
    numSegmentsPerCurve: bool(),
    colorPerCurve: bool(),
    opacityPerCurve: bool(),
    widthPerCurve: bool(),
    capPerCurve: bool(),
    joinPerCurve: bool(),
    dashArrayPerCurve: bool(),
    smoothPerCurve: bool(),
    simplifyPerCurve: bool()
  }), [])

  const genNoise = useMemo(() => simplexNoise2d({ zoom: noiseZoom }), [noiseZoom])

  const genThetaGen = useMemo(() => map(
    noise =>
      ({ center: { x, y } }) => map(
        jitter =>
          Math.PI *
            (
              Math.cos(x) +
              Math.sin(y) +
              (jitter * noise(x, y))
            ),
        number(({ min: 0, max: 0.25 }))
      ),
    genNoise
  ), [genNoise])

  const genField = useCallback(({ width, height }) => flatMap(
    thetaGen =>
      flowField({
        thetaGen,
        resolution: resolution({ width, height }),
        offset: { x: -0.5 * width, y: -0.5 * height },
        dimensions: { width: 2 * width, height: 2 * height }
      }),
    genThetaGen
  ), [resolution, genThetaGen])

  const genStartingPoints = useCallback(({ width, height }) => flatMap(
    noiseSamples => ofShape(noiseSamples.map(([x, y]) => ({ x, y, curveProps: genCurveProps }))),
    blueNoise({
      dimensions: [width, height],
      radius: Math.sqrt(width * height / density),
      samples: 10
    })
  ), [genCurveProps, density])

  const setup = useCallback(({ project }) => {
    const { size } = project.view
    const options = generate(genGlobalCurveSwitches)
    const global = generate(genCurveProps(size))
    const field = generate(genField(size))
    const samples = generate(genStartingPoints(size))

    const background = new Path.Rectangle(project.view.bounds)
    background.fillColor = backgroundColor

    if (shouldDrawGrid && !gridOnTop) {
      drawGrid(field)
    }

    for (const { x, y, curveProps: local } of samples) {
      const segmentLength = (options.segmentLengthPerCurve ? local : global).segmentLength
      const numSegments = (options.numSegmentsPerCurve ? local : global).numSegments
      const curve = drawCurve(field, new Point(x, y), segmentLength, numSegments)

      curve.strokeColor = (options.colorPerCurve ? local : global).strokeColor
      curve.opacity = (options.opacityPerCurve ? local : global).opacity
      curve.strokeWidth = (options.widthPerCurve ? local : global).strokeWidth
      curve.strokeCap = (options.capPerCurve ? local : global).strokeCap
      curve.strokeJoin = (options.joinPerCurve ? local : global).strokeJoin
      curve.dashArray = (options.dashArrayPerCurve ? local : global).dashArray

      if (options.smoothPerCurve) {
        if (local.smooth) {
          curve.smooth()
        }
      } else if (global.smooth) {
        curve.smooth()
      }

      if (options.simplifyPerCurve) {
        if (local.simplify) {
          curve.simplify()
        }
      } else if (global.simplify) {
        curve.simplify()
      }
    }

    if (shouldDrawGrid && gridOnTop) {
      drawGrid(field)
    }
  }, [drawGrid, gridOnTop, shouldDrawGrid, generate, genGlobalCurveSwitches, genCurveProps, genField, genStartingPoints, backgroundColor])

  const onResize = setup

  const { canvasRef } = usePaper({ setup, onResize })

  return (
    <Layout meta={{ title: 'Grids' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
        <ConfigMenu
          onSubmit={event => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Grids')
          }}
        >
          <ConfigField label='Seed' name='seed' value={seed} onChange={R.compose(setSeed, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Resolution Factor: ${resolutionFactor}`} as={Slider} name='multiplier' min={2} max={100} step={0.1} defaultValue={resolutionFactor} onChange={R.compose(setResolutionFactor, Number.parseFloat, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Density: ${density}`} as={Slider} name='samples' min={10} max={1000} defaultValue={density} onChange={R.compose(setDensity, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Noise Zoom: ${noiseZoom}`} as={Slider} name='noiseZoom' min={1} max={1200} defaultValue={noiseZoom} onChange={R.compose(setNoiseZoom, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Min Segments: ${minSegments}`} as={Slider} name='minSegments' min={1} max={60} defaultValue={minSegments} onChange={R.compose(setMinSegments, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Max Segments: ${maxSegments}`} as={Slider} name='maxSegments' min={1} max={60} defaultValue={maxSegments} onChange={R.compose(setMaxSegments, Number.parseInt, R.prop('value'), R.prop('target'))} />
          <ConfigField label={`Draw Grid: ${shouldDrawGrid}`} as={Checkbox} name='shouldDrawGrid' checked={shouldDrawGrid} onChange={() => setShouldDrawGrid(!shouldDrawGrid)} />
          <ConfigField label={`Grid On Top: ${gridOnTop}`} as={Checkbox} name='gridOnTop' checked={gridOnTop} onChange={() => setGridOnTop(!gridOnTop)} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Grids
