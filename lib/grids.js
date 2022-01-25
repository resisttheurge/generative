class FlowGrid {
  constructor () {
    const { width, height } = paper.view.size
    this.noise = makeNoise2D(genInRange(Number.MAX_SAFE_INTEGER))
    this.leftX = Math.floor(width * -0.5)
    this.rightX = Math.floor(width * 1.5)
    this.topY = Math.floor(height * -0.5)
    this.bottomY = Math.floor(height * 1.5)
    this.resolution = Math.floor(width * 0.01)
    this.numColumns = (this.rightX - this.leftX) / this.resolution
    this.numRows = (this.bottomY - this.topY) / this.resolution
    this.grid = []
    for (let col = 0; col < this.numColumns; col++) {
      this.grid.push([])
      for (let row = 0; row < this.numRows; row++) {
        const x = this.leftX + (col * this.resolution)
        const y = this.topY + (row * this.resolution)
        const theta = Math.abs(this.scaledNoise(x, y, 0.008) * 2 * Math.PI)
        this.grid[col].push({
          x, y, theta
        })
      }
    }
  }

  scaledNoise (x, y, scale = 0.002) {
    return this.noise(x * scale, y * scale)
  }

  get width () {
    return this.rightX - this.leftX
  }

  get height () {
    return this.bottomY - this.topY
  }

  drawGrid () {
    for (const col of this.grid) {
      for (const cell of col) {
        // console.dir(cell)
        const { x, y, theta } = cell
        const gridPoint = new Point(x, y)
        const vector = new Point(this.resolution / 2, 0)
        vector.angleInRadians = theta
        const circle = new Path.Circle(gridPoint, this.resolution / 8)
        circle.strokeColor = 'black'
        const path = new Path()
        path.strokeColor = 'black'
        path.moveTo(gridPoint)
        path.lineTo(gridPoint.add(vector))
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
        const xStep = stepLength * Math.cos(theta)
        const yStep = stepLength * Math.sin(theta)
        cur = cur.add(new Point(xStep, yStep))
        curve.lineTo(cur)
      } else {
        break
      }
    }
    return curve
  }
}