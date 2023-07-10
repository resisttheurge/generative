import { List, Range } from 'immutable'
import invariant from 'tiny-invariant'
import { Vector, size, translate, printVector, distance } from '../math/vectors'
import { setIn, getIn, NDimensionalList, fill, fromJS, toJS } from '../data-structures/nd-arrays'
import { map, cartesianProduct } from '../data-structures/sized-tuples'
import { Generator } from './Generator'
import { nShell } from './n-shell'
import { gaussian } from './gaussians'

export type BlueNoiseGenerator<Dimensions extends number> =
  Generator<Array<Vector<Dimensions>>>

export interface BlueNoiseConfig <Dimensions extends number> {
  dimensions: Vector<Dimensions>
  radius: number
  padding?: number
  candidateLimit?: number
  initialPosition?: Vector<Dimensions> | Generator<Vector<Dimensions>>
}

export interface BlueNoiseStateProperties <Dimensions extends number> {
  readonly samples: List<Vector<Dimensions>>
  readonly active: List<number>
  readonly grid: NDimensionalList<number, Dimensions>
}

export interface BlueNoiseState <Dimensions extends number> extends BlueNoiseStateProperties<Dimensions> {
  readonly generateActiveSample: Generator<{ activeIndex: number, sample: Vector<Dimensions> }>
  neighbors: (sample: Vector<Dimensions>) => Array<Vector<Dimensions>>
  canEmit: (sample: Vector<Dimensions>) => boolean
  emitSample: (sample: Vector<Dimensions>) => BlueNoiseState<Dimensions>
  removeActiveIndex: (activeIndex: number) => BlueNoiseState<Dimensions>
}

export class BlueNoiseLibrary <Dimensions extends number> {
  readonly State: new (initialValue: Vector<Dimensions> | BlueNoiseStateProperties<Dimensions>) => BlueNoiseState<Dimensions> = (() => {
    const library = this // eslint-disable-line @typescript-eslint/no-this-alias
    return class implements BlueNoiseState<Dimensions> {
      readonly samples: List<Vector<Dimensions>>
      readonly active: List<number>
      readonly grid: NDimensionalList<number, Dimensions>
      readonly generateActiveSample: Generator<{ activeIndex: number, sample: Vector<Dimensions> }>

      constructor (initialValue: Vector<Dimensions> | BlueNoiseStateProperties<Dimensions>) {
        if (Array.isArray(initialValue)) {
          invariant(library.inBounds(initialValue), () => `initial position ([${printVector(initialValue)}]) must be in bounds`)
          this.samples = List([initialValue])
          this.active = List([0])
          this.grid = setIn(library.emptyGrid, library.gridCoordinates(initialValue), 0)
        } else {
          const { samples, active, grid } = initialValue
          this.samples = samples
          this.active = active
          this.grid = grid
        }

        this.generateActiveSample =
          Generator
            .nat(this.active.size > 0 ? this.active.size - 1 : 0)
            .map(activeIndex => {
              const sampleIdx = this.active.get(activeIndex)
              invariant(typeof sampleIdx === 'number', () => `index (${activeIndex}) not in active list ([${this.active.toJS().join(', ')}])`)
              const sample = this.samples.get(sampleIdx)
              invariant(Array.isArray(sample), () => `index (${sampleIdx}) not in sample list ([${this.samples.toJS().join(', ')}])`)
              return { activeIndex, sample }
            })
      }

      neighbors (sample: Vector<Dimensions>): Array<Vector<Dimensions>> {
        const { grid, samples } = this
        return library.neighborAddresses(sample)
          .map(coordinates => getIn(grid, coordinates, -1))
          .filter(idx => idx !== -1)
          .map(idx => {
            const neighbor = samples.get(idx)
            invariant(neighbor !== undefined, () => `neighbor ${idx} not found in sample list ([${samples.toJS().join(', ')}])`)
            return neighbor
          })
      }

      canEmit (sample: Vector<Dimensions>): boolean {
        const { grid } = this
        const { radius } = library
        const gridIndex = library.gridCoordinates(sample)
        const canEmit =
          getIn(grid, gridIndex) === -1 &&
          this.neighbors(sample).filter(neighbor => distance(sample, neighbor) < radius).length === 0
        if (canEmit) {
          console.log({
            sample,
            coordinates: gridIndex,
            grid: toJS(grid),
            neighbors: this.neighbors(sample),
            tooClose: this.neighbors(sample)
          })
        }
        return canEmit
      }

      emitSample (sample: Vector<Dimensions>): BlueNoiseState<Dimensions> {
        const { samples, active, grid } = this
        return new library.State({
          samples: samples.push(sample),
          active: active.push(samples.size),
          grid: setIn(grid, library.gridCoordinates(sample), samples.size)
        })
      }

      removeActiveIndex (activeIndex: number): BlueNoiseState<Dimensions> {
        const { samples, active, grid } = this
        return new library.State({
          samples,
          active: active.delete(activeIndex),
          grid
        })
      }
    }
  })()

  // config values
  readonly dimensions: Vector<Dimensions>
  readonly radius: number
  readonly padding: number
  readonly candidateLimit: number

  // useful partial computations
  readonly n: Dimensions
  readonly radiusSquared: number
  readonly cellSize: number
  readonly gridDimensions: Vector<Dimensions>
  readonly emptyGrid: NDimensionalList<number, Dimensions>

  // reusable generators
  readonly generateCandidateAroundOrigin: Generator<Vector<Dimensions>>
  readonly generateInitialPosition: Generator<Vector<Dimensions>>

  constructor ({
    dimensions,
    radius,
    padding = 0,
    candidateLimit = 30,
    initialPosition = Generator.tuple(map(
      dimensions,
      dimension => Generator.number({
        min: 0 + padding,
        max: dimension - padding,
        distribution: gaussian({ normalize: true })
      })
    )) as Generator<Vector<Dimensions>>
  }: BlueNoiseConfig<Dimensions>) {
    this.dimensions = dimensions
    this.padding = padding
    this.radius = radius
    this.candidateLimit = candidateLimit

    this.n = size(dimensions)
    this.radiusSquared = radius * radius
    this.cellSize = radius / Math.sqrt(this.n)
    this.gridDimensions = map(this.dimensions, dimension => Math.ceil(dimension / this.cellSize))
    this.emptyGrid = fromJS(fill(-1 as number, this.gridDimensions))
    this.generateCandidateAroundOrigin = nShell(this.n, { min: this.radius, max: 2 * this.radius })
    this.generateInitialPosition =
      initialPosition instanceof Generator
        ? initialPosition
        : Generator.constant(initialPosition)
  }

  gridCoordinates (position: Vector<Dimensions>): Vector<Dimensions> {
    return map(position, (num, i) => Math.floor(num / this.cellSize))
  }

  inBounds (position: Vector<Dimensions>): boolean {
    return position.every((n, i) => n >= 0 + this.padding && n <= this.dimensions[i] - this.padding)
  }

  generateCandidateAround (position: Vector<Dimensions>): Generator<Vector<Dimensions>> {
    return this.generateCandidateAroundOrigin.map(candidate => translate(candidate, position))
  }

  neighborAddresses (position: Vector<Dimensions>): Array<Vector<Dimensions>> {
    invariant(this.inBounds(position), () => `position ([${position.join(', ')}]) not in bounds`)
    return cartesianProduct(
      map(this.gridCoordinates(position), (coordinate, i) =>
        Range(
          Math.max(coordinate - 1, 0),
          Math.min(coordinate + 1, this.gridDimensions[i]) + 1,
          1
        ).toJS()
      )
    )
  }

  generateBlueNoise (initialPosition: Vector<Dimensions>): BlueNoiseGenerator<Dimensions> {
    invariant(this.inBounds(initialPosition), () => `initial position ([${initialPosition.join(', ')}]) not in bounds`)
    return new Generator(
      rngState => {
        let currentRngState = rngState
        let currentNoiseState = new this.State(initialPosition)
        while (currentNoiseState.active.size > 0) {
          const [idxRngState, { activeIndex, sample }] = currentNoiseState.generateActiveSample.run(currentRngState)
          currentRngState = idxRngState
          let count
          for (count = 0; count < this.candidateLimit; count++) {
            const [nextCandidateRngState, nextCandidate] = this.generateCandidateAround(sample).run(currentRngState)
            currentRngState = nextCandidateRngState
            if (this.inBounds(nextCandidate) && currentNoiseState.canEmit(nextCandidate)) {
              currentNoiseState = currentNoiseState.emitSample(nextCandidate)
              break
            }
          }
          if (count === this.candidateLimit) {
            currentNoiseState = currentNoiseState.removeActiveIndex(activeIndex)
          }
        }
        return [currentRngState, currentNoiseState.samples.toArray()]
      }
    )
  }
}

export function blueNoise <Dimensions extends number> (config: BlueNoiseConfig<Dimensions>, initialPosition?: Vector<Dimensions>): Generator<Array<Vector<Dimensions>>> {
  const library = new BlueNoiseLibrary(config)
  if (initialPosition !== undefined) {
    return library.generateBlueNoise(initialPosition)
  } else {
    return library.generateInitialPosition.flatMap(library.generateBlueNoise.bind(library))
  }
}
