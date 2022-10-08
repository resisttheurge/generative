/* global Blob */

import * as tome from 'chromotome'
import paper, { Point, Path } from 'paper'
import { blueNoiseLib, blueNoise, number, chooseFrom, int, bool, simplexNoise2d, flatMap, record, repeat, ofShape, uniform, map, tuple, seed } from '../../lib/generator'
import * as R from 'ramda'
import { fromJS } from 'immutable'
import { useState } from 'react'
import { IconButton, Layout } from '../../components'
import { Box, Button, Field } from 'theme-ui'
import usePaper from '../../lib/usePaper'
import { saveAs } from 'file-saver'

// State
const initGrid = ({ position, width, height, resolution, noise, thetaGen }) => {
  const [numCols, numRows] = [width / resolution, height / resolution].map(Math.floor)

  const generator = map(
    fromJS,
    tuple(
      R.range(0, numCols)
        .map(col =>
          tuple(
            R.range(0, numRows)
              .map(row => {
                const x = position.x + (col * resolution)
                const y = position.y + (row * resolution)
                const theta = thetaGen({ x, y, col, row, numCols, numRows })
                return ofShape({ x, y, theta })
              })
          )
        )
    )
  )

  const gridCoordinates = ({ x, y }) =>
    [
      (x - position.x) / resolution,
      (y - position.y) / resolution
    ].map(Math.floor)

  const inBounds = (position) => {
    // console.log(position)
    const [col, row] = gridCoordinates(position)
    // console.log(col, row)
    return col >= 0 && col < numCols && row >= 0 && row < numRows
  }

  const createCurve = (grid, start, stepLength = resolution, numSteps = 1) => {
    const curve = new Path()
    curve.moveTo(start)
    let cur = start
    for (let n = 0; n < numSteps; n++) {
      if (inBounds(cur)) {
        const cell = grid.getIn(gridCoordinates(cur))
        const { theta } = cell.toJS()
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

  return {
    position,
    width,
    height,
    resolution,
    numCols,
    numRows,
    generator,
    gridCoordinates,
    inBounds,
    createCurve
  }
}

// Random Generators
const dashArray = segmentLength =>
  flatMap(
    numDashPairs =>
      repeat(numDashPairs * 2, number({ min: 0, max: segmentLength })),
    int({ min: 0, max: 0 })
  )

const safeStrokeColor = ({ palette, backgroundColor }) =>
  chooseFrom(
    palette.colors
      .filter(color => color !== backgroundColor)
  )

const curveConfig = ({ resolution, palette, backgroundColor }) =>
  flatMap(
    ({ segmentLengthFactor, genDashArray, miterLimitFactor }) => {
      const segmentLength = resolution / segmentLengthFactor
      const miterLimit = segmentLength / miterLimitFactor
      return ofShape({
        miterLimit,
        segmentLength,
        numSegments: int({ min: 10, max: 40 }),
        strokeColor: safeStrokeColor({ palette, backgroundColor }),
        opacity: number({ min: 0.1, max: 1 }),
        strokeWidth: int({ min: 1, max: resolution }),
        strokeCap: chooseFrom(['butt', 'round', 'square']),
        strokeJoin: chooseFrom(['miter', 'round', 'bevel']),
        smooth: bool(),
        simplify: bool(),
        dashArray: genDashArray ? dashArray(segmentLength) : []
      })
    },
    record({
      segmentLengthFactor: number({ min: 1, max: 4 }),
      genDashArray: bool(),
      miterLimitFactor: number({ min: 1, max: 4 })
    })
  )

const curveGenOptions = record({
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
})

const config = ({ position = { x: 0, y: 0 }, width, height }) =>
  flatMap(
    ({ palette, resolutionFactor, noiseComponent, piDivisions, noise, ...config }) => {
      const backgroundColor = palette.background || 0xffffffff
      const resolution = width / resolutionFactor
      return ofShape({
        ...config,
        position,
        width,
        height,
        palette,
        backgroundColor,
        resolutionFactor,
        resolution,
        noiseComponent,
        piDivisions,
        noise,
        thetaGen: ({ x, y, col, row, numCols, numRows }) =>
          map(
            jitter =>
              Math.PI *
              (
                Math.cos(x) +
                Math.sin(y) +
                (jitter * noise(x, y))
              ),
            number(({ min: 0, max: 0.25 }))
          ),
        poissonRadius: map(
          resolutionFactorNumerator =>
            resolution * resolutionFactorNumerator / resolutionFactor,
          int({ min: 1, max: resolutionFactor })
        ),
        globalCurveProperties: curveConfig({ resolution, palette, backgroundColor })
      })
    },
    record({
      curveGenOptions,
      palette: chooseFrom(tome.getAll()),
      resolutionFactor: number({ min: 5, max: 50 }),
      noiseComponent: uniform,
      piDivisions: chooseFrom([2, 3, 5, 7, 11]),
      poissonSamples: int({ min: 5, max: 10 }),
      noise: flatMap(zoom => simplexNoise2d({ zoom }), number({ min: 10, max: 1000 }))
    })
  )

const data = ({ position, width, height }) =>
  flatMap(
    conf => {
      const lib = initGrid({ position: { x: -0.5 * width, y: -0.5 * height }, width: 2 * width, height: 2 * height, ...conf })
      const curveConfigGen = curveConfig({ resolution: lib.resolution, palette: conf.palette, backgroundColor: conf.backgroundColor })
      const sampler = flatMap(
        noiseSamples => {
          // console.dir(noiseSamples)
          const result = noiseSamples.map(([x, y]) => ofShape({ x, y, curveConfig: curveConfigGen }))
          // console.dir(result)
          return tuple(result.toJS())
        },
        blueNoise(blueNoiseLib({
          dimensions: [width, height],
          radius: conf.poissonRadius,
          samples: conf.poissonSamples
        }))
      )
      return map(
        ({ grid, samples }) => ({
          lib,
          grid,
          samples,
          config: conf
        }),
        ofShape({
          grid: lib.generator,
          samples: sampler
        }))
    },
    config({ position, width, height })
  )

const Grids = () => {
  const [configOpen, setConfigOpen] = useState(false)
  const [seedStr, setSeedStr] = useState('Griidsss')

  let curSeed = seed(seedStr)

  const setup = () => {
    const [{ lib, grid, samples, config }, setupSeed] = data(paper.view.size)(curSeed)
    curSeed = setupSeed

    // console.groupCollapsed('Data')
    // console.dir({ lib, grid, samples, config })
    // console.groupEnd()

    const background = new Path.Rectangle(paper.view.bounds)
    background.fillColor = config.backgroundColor

    const options = config.curveGenOptions
    const global = config.globalCurveProperties
    for (const { x, y, curveConfig: local } of samples) {
      const segmentLength = (options.segmentLengthPerCurve ? local : global).segmentLength
      const numSegments = (options.numSegmentsPerCurve ? local : global).numSegments
      const curve = lib.createCurve(grid, new Point(x, y), segmentLength, numSegments)

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
  }

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Grids' }}>
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
          <Button
            variant='primary'
            sx={{
              justifySelf: 'stretch'
            }}
            onClick={() => {
              const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
              saveAs(data, 'Grids')
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

export default Grids
