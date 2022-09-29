import * as R from 'ramda'
import * as g from './generators'

export const poissonGenerator = (dimensions, radius, samples, callback) => {
  // constants
  const radiusSquared = radius * radius
  const A = 4 * radiusSquared - radiusSquared
  const [width, height] = dimensions
  const [minPos, maxPos] = [
    [radius, radius],
    [width - radius, height - radius]
  ]
  const cellSize = radius * Math.SQRT1_2
  const gridWidth = Math.ceil(width / cellSize)
  const gridHeight = Math.ceil(height / cellSize)

  // state
  const grid = new Array(gridWidth * gridHeight)
  const queue = []

  // lib
  const gridCoords = ([x, y]) => {
    return [(x / cellSize) | 0, (y / cellSize) | 0]
  }

  const gridIndex = pos => {
    const [x, y] = gridCoords(pos)
    return [gridWidth * y + x]
  }

  const emitSample = pos => {
    queue.push(pos)
    grid[gridIndex(pos)] = pos
    callback && callback(pos)
    return pos
  }

  const generateAround = ([x, y]) => {
    const θ = Math.random() * 2 * Math.PI
    const r = Math.sqrt(Math.random() * A + radiusSquared)
    return [x + r * Math.cos(θ), y + r * Math.sin(θ)]
  }

  const inBounds = ([x, y]) => {
    const [x0, y0] = minPos
    const [x1, y1] = maxPos
    return x0 <= x && x <= x1 && y0 <= y && y <= y1
  }

  const distanceSquared = ([x0, y0], [x1, y1]) => {
    const [dx, dy] = [x1 - x0, y1 - y0]
    return dx * dx + dy * dy
  }

  const near = pos => {
    const [x, y] = gridCoords(pos)
    const [[x0, y0], [x1, y1]] = [
      [Math.max(x - 2, 0), Math.max(y - 2, 0)],
      [Math.min(x + 3, gridWidth), Math.min(y + 3, gridHeight)]
    ]
    for (let y = y0; y < y1; ++y) {
      const rowIndex = y * gridWidth
      for (let x = x0; x < x1; ++x) {
        const gridEntry = grid[rowIndex + x]
        if (gridEntry && distanceSquared(gridEntry, pos) < radiusSquared) {
          return true
        }
      }
    }
    return false
  }

  const genInRange = (min, max) => {
    if (max === undefined) {
      max = min
      min = 0
    }
    return ((Math.random() * (max - min)) | 0) + min
  }

  const genInitPos = () => {
    const [[x0, y0], [x1, y1]] = [minPos, maxPos]
    return [genInRange(x0, x1), genInRange(y0, y1)]
  }

  // generator
  return {
    grid,
    queue,
    * generator (initPos) {
      yield emitSample(initPos === undefined ? genInitPos() : initPos)
      while (queue.length > 0) {
        const curIdx = genInRange(queue.length)
        const curPos = queue[curIdx]
        // console.log(queue, curIdx)
        let count
        for (count = 0; count < samples; ++count) {
          const candidate = generateAround(curPos)
          if (inBounds(candidate) && !near(candidate)) {
            yield emitSample(candidate)
            break
          }
        }
        if (count >= samples) {
          const tail = queue.pop()
          if (queue.length !== 0) {
            queue[curIdx] = tail
          }
        }
      }
    }
  }
}

export const seededPoissonGenerator = (dimensions, radius, samples) => {
  // constants
  const radiusSquared = radius * radius
  const A = 4 * radiusSquared - radiusSquared
  const [width, height] = dimensions
  const [[minX, minY], [maxX, maxY]] = [
    [radius, radius],
    [width - radius, height - radius]
  ]
  const cellSize = radius * Math.SQRT1_2
  const gridWidth = Math.ceil(width / cellSize)
  const gridHeight = Math.ceil(height / cellSize)

  // state
  const grid = new Array(gridWidth * gridHeight)
  const queue = []

  // lib
  const gridCoords = ([x, y]) => {
    return [(x / cellSize) | 0, (y / cellSize) | 0]
  }

  const gridIndex = pos => {
    const [x, y] = gridCoords(pos)
    return [gridWidth * y + x]
  }

  const emitSample = pos => {
    queue.push(pos)
    grid[gridIndex(pos)] = pos
    return pos
  }

  const genCandidate = ([x, y]) =>
    R.pipe(
      g.arrayOf(2),
      g.map(([n1, n2]) => [n1 * 2 * Math.PI, Math.sqrt(n2 * A + radiusSquared)]),
      g.map(([θ, r]) => [x + r * Math.cos(θ), y + r * Math.sin(θ)])
    )(g.unit)

  const inBounds = ([x, y]) => minX <= x && x <= maxX && minY <= y && y <= maxY

  const distanceSquared = ([x0, y0], [x1, y1]) => {
    const [dx, dy] = [x1 - x0, y1 - y0]
    return dx * dx + dy * dy
  }

  const near = pos => {
    const [x, y] = gridCoords(pos)
    const [[x0, y0], [x1, y1]] = [
      [Math.max(x - 2, 0), Math.max(y - 2, 0)],
      [Math.min(x + 3, gridWidth), Math.min(y + 3, gridHeight)]
    ]
    for (let y = y0; y < y1; ++y) {
      const rowIndex = y * gridWidth
      for (let x = x0; x < x1; ++x) {
        const gridEntry = grid[rowIndex + x]
        if (gridEntry && distanceSquared(gridEntry, pos) < radiusSquared) {
          return true
        }
      }
    }
    return false
  }

  const genInitPos =
    g.tuple([g.number(minX, maxX), g.number(minY, maxY)])

  // generator
  return function * PoissonGenerator (rng) {
    yield emitSample(g.apply(rng, genInitPos))
    let i = 0
    while (queue.length > 0) {
      console.groupCollapsed(`Iteration ${i++}`)
      console.log('Grid:', grid)
      console.log('Queue:', queue)
      const curIdx = g.apply(rng, g.nat(queue.length))
      console.log(`Current index: ${curIdx}`)
      const curPos = queue[curIdx]
      console.log(`Current position: ${curPos}`)
      let count
      for (count = 0; count < samples; ++count) {
        const candidate = g.apply(rng, genCandidate(curPos))
        console.log('Candidate:', candidate)
        if (inBounds(candidate) && !near(candidate)) {
          yield emitSample(candidate)
          break
        }
      }
      if (count >= samples) {
        const tail = queue.pop()
        if (queue.length !== 0) {
          queue[curIdx] = tail
        }
      }
      console.groupEnd()
    }
  }
}

export default poissonGenerator
