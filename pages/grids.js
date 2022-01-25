import Sketch from '../components/Sketch'
import PaperCanvas from '../components/PaperCanvas'
import * as tome from 'chromotome'
import { makeNoise2D } from 'open-simplex-noise'
import paper, { Point, Path } from 'paper'
import poissonGenerator from '../lib/poisson'
import { genInRange, chooseOne, genIntInRange, genBool } from '../lib/random'

class Grid {
  constructor ({ width, height, noiseSeed, resolution, noiseScale, thetaFn }) {
    this.noise = makeNoise2D(noiseSeed)
    this.leftX = Math.floor(width * -0.5)
    this.rightX = Math.floor(width * 1.5)
    this.topY = Math.floor(height * -0.5)
    this.bottomY = Math.floor(height * 1.5)
    this.resolution = resolution
    this.numColumns = Math.floor((this.rightX - this.leftX) / this.resolution)
    this.numRows = Math.floor((this.bottomY - this.topY) / this.resolution)
    this.grid = []
    this.noiseScale = noiseScale
    for (let col = 0; col < this.numColumns; col++) {
      this.grid.push([])
      for (let row = 0; row < this.numRows; row++) {
        const x = this.leftX + (col * this.resolution)
        const y = this.topY + (row * this.resolution)
        const theta = thetaFn(col, row, x, y, this.numColumns, this.numRows, this.scaledNoise.bind(this))
        this.grid[col].push({
          x, y, theta
        })
      }
    }
  }

  scaledNoise (x, y) {
    return this.noise(x * this.noiseScale, y * this.noiseScale)
  }

  get width () {
    return this.rightX - this.leftX
  }

  get height () {
    return this.bottomY - this.topY
  }

  drawGrid () {
    for (let col = 0; col < this.numColumns; col++) {
      const vLine = new Path.Line(new Point(col * this.resolution, this.topY), new Point(col * this.resolution, this.bottomY))
      vLine.strokeColor = 'black'
      for (let row = 0; row < this.numRows; row++) {
        const hLine = new Path.Line(new Point(this.leftX, row * this.resolution), new Point(this.rightX, row * this.resolution))
        hLine.strokeColor = 'black'

        // console.dir(cell)
        const { theta } = this.grid[col][row]
        const gridPoint = new Point(col * this.resolution, row * this.resolution)

        const center = gridPoint.add(this.resolution / 2)
        const circle = new Path.Circle(center, this.resolution / 8)
        circle.strokeColor = 'black'

        const vector = new Point(this.resolution / 2, 0)
        vector.angleInRadians = theta
        const path = new Path()
        path.strokeColor = 'black'
        path.moveTo(center)
        path.lineTo(center.add(vector))
      }
    }
  }

  createCurve (start, stepLength = this.resolution, numSteps = 1) {
    const curve = new Path()
    curve.moveTo(start)
    let cur = start
    for (let n = 0; n < numSteps; n++) {
      const xOffset = cur.x - this.leftX
      const yOffset = cur.y - this.topY
      const col = Math.floor(xOffset / this.resolution)
      const row = Math.floor(yOffset / this.resolution)
      if (
        col >= 0 && col < this.numColumns &&
        row >= 0 && row < this.numRows
      ) {
        const { theta } = this.grid[col][row]
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
}

const genDashArray = (segmentLength) => {
  const numDashPairs = genIntInRange(0)
  const result = []
  for (let n = 0; n < numDashPairs; n++) {
    result.push(genInRange(segmentLength))
    result.push(genInRange(segmentLength))
  }
  return result
}

const genCurveConfig = ({ resolution, palette }) => {
  const segmentLength = resolution / genInRange(1, 4)
  return ({
    segmentLength,
    numSegments: genIntInRange(10, 40),
    strokeColor: chooseOne(palette.colors),
    opacity: genInRange(0.1, 1),
    strokeWidth: genIntInRange(1, resolution),
    strokeCap: chooseOne(['butt', 'round', 'square']),
    strokeJoin: chooseOne(['miter', 'round', 'bevel']),
    dashArray: genBool() ? genDashArray(segmentLength) : [],
    miterLimit: segmentLength / genInRange(1, 4),
    smooth: chooseOne([true, false]),
    simplify: chooseOne([true, false])
  })
}

const genConfig = ({ height, width }) => {
  const palette = tome.getRandom()
  const backgroundColor = palette.background || 0xffffffff
  const resolutionFactor = genInRange(5, 50)
  const resolution = width / resolutionFactor
  const noiseComponent = genInRange(1)
  const piDivisions = chooseOne([2, 3, 5, 7, 11])
  const result = ({
    width,
    height,
    palette,
    resolution,
    resolutionFactor,
    backgroundColor,
    noiseSeed: genInRange(Number.MAX_SAFE_INTEGER),
    noiseScale: genInRange(0.0001, 0.1),
    noiseComponent,
    piDivisions,
    thetaFn: (col, row, x, y, numCols, numRows, noiseFn) => (Math.cos(x) + Math.sin(y) + (noiseFn(x, y) * genInRange(0.25))) * Math.PI,
    poissonRadius: resolution * genIntInRange(1, resolutionFactor) / resolutionFactor,
    poissonSamples: genIntInRange(5, 10),
    curveGenOptions: {
      segmentLengthPerCurve: genBool(),
      numSegmentsPerCurve: genBool(),
      colorPerCurve: genBool(),
      opacityPerCurve: genBool(),
      widthPerCurve: genBool(),
      capPerCurve: genBool(),
      joinPerCurve: genBool(),
      dashArrayPerCurve: genBool(),
      smoothPerCurve: genBool(),
      simplifyPerCurve: genBool()
    },
    globalCurveProperties: genCurveConfig({ resolution, palette })
  })

  while (!result.curveGenOptions.colorPerCurve && result.globalCurveProperties.strokeColor === backgroundColor) {
    result.globalCurveProperties.strokeColor = chooseOne(palette.colors)
  }

  return result
}

const Grids = () => (
  <Sketch>
    <PaperCanvas
      paperFn={() => {
        const config = genConfig(paper.view.size)
        console.dir(config)

        const background = new Path.Rectangle(paper.view.bounds)
        background.fillColor = config.backgroundColor

        const grid = new Grid(config)

        // grid.drawGrid()

        const { generator } = poissonGenerator([grid.width, grid.height], config.poissonRadius, config.poissonSamples, () => {})
        console.groupCollapsed('Individual Curves')
        for (const [x, y] of generator()) {
          const options = config.curveGenOptions
          const global = config.globalCurveProperties
          const local = genCurveConfig(config)

          console.dir(local)

          const segmentLength = (options.segmentLengthPerCurve ? local : global).segmentLength
          const numSegments = (options.numSegmentsPerCurve ? local : global).numSegments
          const curve = grid.createCurve(new Point(x + grid.leftX, y + grid.topY), segmentLength, numSegments)

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
        console.groupEnd()
      }}
    />
  </Sketch>
)

export default Grids
