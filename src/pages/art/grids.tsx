/* global Blob */

import * as tome from 'chromotome'
import paper, { Path, Color } from 'paper'
import { Generator } from '../../lib/generators/Generator'
import {
  flowGrid,
  makePath,
  Flow,
  defaultFlowMapper,
  FlowGenerator,
} from '../../lib/generators/flow-fields'
import { useCallback, useMemo, useState } from 'react'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { Box, Checkbox, Select, Slider, useThemeUI } from 'theme-ui'
import { PaperSetup, useGenerators, usePaper } from '../../effects'
import { saveAs } from 'file-saver'
import { GridField } from '../../lib/math/2d/fields/GridField'
import { translate } from '../../lib/math/vectors'
import { drawCurve } from '../../lib/utils/paper-utils'
import { extractColor } from '../../lib/utils/theme-ui-utils'
import { noise2D } from '../../lib/generators/simplex-noise'
import { blueNoise } from '../../lib/generators/blue-noise'

type StrokeCap = 'butt' | 'round' | 'square'
type StrokeJoin = 'miter' | 'round' | 'bevel'
interface CurveConfig {
  segmentLength: number
  miterLimit: number
  numSegments: number
  strokeColor: paper.Color
  opacity: number
  strokeWidth: number
  strokeCap: StrokeCap
  strokeJoin: StrokeJoin
  smooth: boolean
  simplify: boolean
  dashArray: number[]
}

const { number, choose, int, bool, record, sequence, tuple, constant } =
  Generator

const genStrokeCap: Generator<StrokeCap> = choose([
  'butt' as const,
  'round' as const,
  'square' as const,
])
const genStrokeJoin: Generator<StrokeJoin> = choose([
  'miter' as const,
  'round' as const,
  'bevel' as const,
])

const genGlobalCurveSwitches = record({
  segmentLengthPerCurve: bool(),
  numSegmentsPerCurve: bool(),
  colorPerCurve: bool(),
  opacityPerCurve: bool(),
  widthPerCurve: bool(),
  capPerCurve: bool(),
  joinPerCurve: bool(),
  dashArrayPerCurve: bool(),
  smoothPerCurve: bool(),
  simplifyPerCurve: bool(),
})

const genDashArray = (segmentLength: number): Generator<number[]> => {
  const dashGenerator = number({ min: 0.1, max: segmentLength / 5 })
  return int({ min: 1, max: 5 }).flatMap(numDashPairs =>
    dashGenerator.repeat(numDashPairs * 2),
  )
}

const Grids: React.FC = () => {
  const [seed, setSeed] = useState('Help me out here')
  const [palette, setPalette] = useState(tome.getRandom())
  const [resolution, setResolution] = useState(15)
  const [density, setDensity] = useState(100)
  const [noiseZoom, setNoiseZoom] = useState(100)
  const [maxSegments, setMaxSegments] = useState(30)
  const [shouldDrawGrid, setShouldDrawGrid] = useState(false)
  const [gridOnTop, setGridOnTop] = useState(false)
  const { generate } = useGenerators(seed)
  const { theme } = useThemeUI()

  const backgroundColor = useMemo(
    () =>
      new paper.Color(
        palette.background ?? extractColor(theme.rawColors?.background),
      ),
    [palette, theme],
  )
  const textColor = useMemo(
    () =>
      new paper.Color(palette.stroke ?? extractColor(theme.rawColors?.text)),
    [palette, theme],
  )

  const drawGrid = useCallback(
    (field: GridField<Flow>) => {
      const frame = new Path.Rectangle(field.bounds)
      frame.strokeColor = new paper.Color(textColor)
      frame.fillColor = new paper.Color(backgroundColor)

      const rowLines: paper.Path[] = []
      const colLines: paper.Path[] = []
      const flowArrows: paper.Path[] = []

      for (const row of field.rows) {
        if (row > 0) {
          // don't draw the top row, since it's already drawn by the frame
          const rowLine = drawCurve([
            [field.bounds.min[0], row],
            [field.bounds.max[0], row],
          ])
          rowLine.strokeColor = textColor
          rowLines.push(rowLine)
        }

        for (const col of field.cols) {
          if (col > 0) {
            // don't draw the left column, since it's already drawn by the frame
            const colLine = drawCurve([
              [col, field.bounds.min[1]],
              [col, field.bounds.max[1]],
            ])
            colLine.strokeColor = textColor
            colLines.push(colLine)
          }

          const cell = field.getCell([col, row])
          if (cell.hasData()) {
            const flowArrow = drawCurve([
              cell.center,
              translate<2>(cell.center, defaultFlowMapper(cell.data)),
            ])
            flowArrow.strokeColor = textColor
            flowArrows.push(flowArrow)
          }
        }
      }

      return { frame, rowLines, colLines, flowArrows }
    },
    [textColor, backgroundColor],
  )

  const genSafeLineColor: Generator<paper.Color> = useMemo(
    () => choose(palette.colors).map(color => new Color(color)),
    [palette],
  )

  const genCurveProps: (cellSize: number) => Generator<CurveConfig> =
    useCallback(
      (cellSize: number) =>
        number({ min: 1, max: 4 })
          .map(factor => cellSize / factor)
          .flatMap(segmentLength =>
            sequence({
              segmentLength,
              miterLimit: number({ min: 1, max: 4 }).map(
                factor => segmentLength / factor,
              ),
              numSegments: int({ min: 1, max: maxSegments }),
              strokeColor: genSafeLineColor,
              opacity: number({ min: 0.1, max: 1 }),
              strokeWidth: int({ min: 1, max: cellSize }),
              strokeCap: genStrokeCap,
              strokeJoin: genStrokeJoin,
              smooth: bool(),
              simplify: bool(),
              dashArray: bool().flatMap(dashArray =>
                dashArray ? genDashArray(segmentLength) : constant([]),
              ),
            }),
          ),
      [maxSegments, genSafeLineColor],
    )

  const genNoise = useMemo(() => noise2D({ zoom: noiseZoom }), [noiseZoom])

  const genFlow: FlowGenerator = useMemo(
    () =>
      ({ center: [x, y] }) =>
        tuple([genNoise, number({ min: 0, max: 0.25 })]).map(
          ([noise, jitter]) =>
            Math.PI * (Math.cos(x) + Math.sin(y) + jitter * noise([x, y])),
        ),
    [genNoise],
  )

  const genField = useCallback(
    ({ width, height }: paper.Size) =>
      flowGrid([width, height], resolution, genFlow),
    [resolution, genFlow],
  )

  const genStartingPoints = useCallback(
    (field: GridField<Flow>) =>
      blueNoise({
        dimensions: field.dimensions,
        radius: Math.sqrt(
          (field.dimensions[0] * field.dimensions[1]) / density,
        ),
        candidateLimit: 10,
      }).flatMap(noiseSamples =>
        sequence(
          noiseSamples.map(([x, y]) => ({
            x,
            y,
            curveProps: genCurveProps(field.cellSize),
          })),
        ),
      ),
    [density, genCurveProps],
  )

  const setup: PaperSetup = useCallback(
    ({
      project: {
        view: { size, bounds },
      },
    }) => {
      const options = generate(genGlobalCurveSwitches)
      const field = generate(genField(size))
      const global = generate(genCurveProps(field.cellSize))
      const samples = generate(genStartingPoints(field))

      const background = new Path.Rectangle(bounds)
      background.fillColor = backgroundColor

      if (shouldDrawGrid && !gridOnTop) {
        drawGrid(field)
      }

      for (const { x, y, curveProps: local } of samples) {
        const segmentLength = (options.segmentLengthPerCurve ? local : global)
          .segmentLength
        const numSegments = (options.numSegmentsPerCurve ? local : global)
          .numSegments
        const path = makePath(field, [x, y], segmentLength, numSegments)
        if (path.length < 2) {
          continue
        }
        const curve = drawCurve(path)

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
    },
    [
      drawGrid,
      gridOnTop,
      shouldDrawGrid,
      generate,
      genCurveProps,
      genField,
      genStartingPoints,
      backgroundColor,
    ],
  )

  const { canvasRef } = usePaper(setup)

  return (
    <Layout meta={{ title: 'Grids' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob(
              [paper.project.exportSVG({ asString: true }) as string],
              { type: 'image/svg+xml;charset=utf-8' },
            )
            saveAs(data, 'Grids')
          }}
        >
          <ConfigField
            label='Seed'
            name='seed'
            value={seed}
            onChange={({ target: { value } }) => setSeed(value)}
          />
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
          <ConfigField
            label={`Resolution: ${resolution}`}
            as={Slider}
            name='resolution'
            min={10}
            max={50}
            step={1}
            defaultValue={resolution}
            onChange={({ target: { value } }) =>
              setResolution(Number.parseFloat(value))
            }
          />
          <ConfigField
            label={`Density: ${density}`}
            as={Slider}
            name='density'
            min={10}
            max={1000}
            defaultValue={density}
            onChange={({ target: { value } }) =>
              setDensity(Number.parseInt(value))
            }
          />
          <ConfigField
            label={`Noise Zoom: ${noiseZoom}`}
            as={Slider}
            name='noiseZoom'
            min={1}
            max={1200}
            defaultValue={noiseZoom}
            onChange={({ target: { value } }) =>
              setNoiseZoom(Number.parseInt(value))
            }
          />
          <ConfigField
            label={`Max Segments: ${maxSegments}`}
            as={Slider}
            name='maxSegments'
            min={1}
            max={60}
            defaultValue={maxSegments}
            onChange={({ target: { value } }) =>
              setMaxSegments(Number.parseInt(value))
            }
          />
          <ConfigField
            label={`Draw Grid: ${shouldDrawGrid ? 'true' : 'false'}`}
            as={Checkbox}
            name='shouldDrawGrid'
            checked={shouldDrawGrid}
            onChange={() => setShouldDrawGrid(!shouldDrawGrid)}
          />
          <ConfigField
            label={`Grid On Top: ${gridOnTop ? 'true' : 'false'}`}
            as={Checkbox}
            name='gridOnTop'
            checked={gridOnTop}
            onChange={() => setGridOnTop(!gridOnTop)}
          />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default Grids
