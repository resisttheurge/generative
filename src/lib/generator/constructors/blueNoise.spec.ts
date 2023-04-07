/* eslint-env jest */

import fc from 'fast-check'
import { curry, map, pipe, reduce, sum, zip, zipWith } from 'ramda'

import { blueNoiseLib, blueNoise } from './blueNoise'

import { shouldBeAGeneratorConstructor } from './index.spec'
import { arbSeed } from '../seeder.spec'
import { Generator } from '../Generator'
import { List } from 'immutable'
import { sphericalAnnulus } from './sphericalAnnulus'

export const MAX_BLUE_NOISE_SAMPLES = 1e3

export const arbPos =
  dimensions => fc.tuple(...dimensions.map(d => fc.float({ min: 0, max: d, noDefaultInfinity: true, noNaN: true })))

export const arbState =
  lib =>
    fc.array(arbPos(lib.dimensions), { size: 'medium', minLength: 1, maxLength: lib.gridDimensions.reduce((acc, next) => acc * next, 1) })
      .map(
        ([initPos, ...positions]) =>
          reduce(
            (state, position) =>
              state.grid.getIn(lib.gridCoordinates(position)) === -1
                ? ({ active: state.active.push(state.samples.size), samples: state.samples.push(position), grid: state.grid.setIn(lib.gridCoordinates(position), state.samples.size) })
                : state,
            lib.initState(initPos),
            positions
          )
      )

export const arbBlueNoiseConfig =
  ({ maxSamples = MAX_BLUE_NOISE_SAMPLES } = {}) =>
    fc.record({
      dimensions: fc.array(fc.float({ noDefaultInfinity: true, noNaN: true, min: 1, max: Math.pow(2, 31) }), { minLength: 1 }),
      radius: fc.float({ noDefaultInfinity: true, noNaN: true, min: 1, max: Math.pow(2, 31) }),
      samples: fc.integer({ min: 20, max: 45 })
    }).filter(
      ({ dimensions, radius, samples }) => {
        const cellSize = radius / Math.sqrt(dimensions.length)
        const totalSamples =
          pipe(
            map(dim => Math.ceil(dim / cellSize)),
            reduce((a, b) => a * b, 1)
          )(dimensions)
        return totalSamples < maxSamples
      }
    )

export const arbBlueNoiseLib =
  (arbConfig = arbBlueNoiseConfig()) =>
    arbConfig.map(blueNoiseLib)

export const arbBlueNoise =
  (arbLib = arbBlueNoiseLib()) =>
    arbLib.map(blueNoise)

const gridDepth =
  grid => {
    let depth = 0
    let currentGrid = grid
    while (List.isList(currentGrid) && currentGrid.size > 0) {
      currentGrid = currentGrid.get(0)
      depth++
    }
    return depth
  }

const checkGridDimensions = curry(
  (dimensions, grid) => {
    if (dimensions.length === 0 && !List.isList(grid)) {
      return true
    } else if (dimensions.length > 0 && List.isList(grid)) {
      const [dim, ...dims] = dimensions
      return grid.size === dim && grid.every(checkGridDimensions(dims))
    } else {
      return false
    }
  }
)

const distance2 = pipe(
  zipWith((a, b) => Math.pow(b - a, 2)),
  sum
)

const distance = pipe(
  distance2,
  Math.sqrt
)

describe('The blueNoiseLib function', () => {
  describe('should return an object with the following members for a given config object', () => {
    describe('dimensions', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { dimensions } = blueNoiseLib(config)
              expect(dimensions).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the given config.dimensions', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { dimensions } = blueNoiseLib(config)
              expect(dimensions).toBe(config.dimensions)
            }
          )
        )
      })
    })
    describe('radius', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { radius } = blueNoiseLib(config)
              expect(radius).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the given config.radius', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { radius } = blueNoiseLib(config)
              expect(radius).toBe(config.radius)
            }
          )
        )
      })
    })
    describe('samples', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { samples } = blueNoiseLib(config)
              expect(samples).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the given config.samples', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { samples } = blueNoiseLib(config)
              expect(samples).toBe(config.samples)
            }
          )
        )
      })
    })
    describe('n', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { n } = blueNoiseLib(config)
              expect(n).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the length of the given config.dimensions', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { n } = blueNoiseLib(config)
              expect(n).toBe(config.dimensions.length)
            }
          )
        )
      })
    })
    describe('radius2', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { radius2 } = blueNoiseLib(config)
              expect(radius2).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the square of the given config.radius', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { radius2 } = blueNoiseLib(config)
              expect(radius2).toBe(config.radius * config.radius)
            })
        )
      })
    })
    describe('sqrtN', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { sqrtN } = blueNoiseLib(config)
              expect(sqrtN).toBeDefined()
            }
          )
        )
      })
      it('should be equal to the square root of n', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { n, sqrtN } = blueNoiseLib(config)
              expect(sqrtN).toBe(Math.sqrt(n))
            }
          )
        )
      })
    })
    describe('cellSize', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { cellSize } = blueNoiseLib(config)
              expect(cellSize).toBeDefined()
            }
          )
        )
      })
      it('should be the equal to the radius / sqrtN', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { radius, sqrtN, cellSize } = blueNoiseLib(config)
              expect(cellSize).toBe(radius / sqrtN)
            }
          )
        )
      })
    })
    describe('gridDimensions', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { gridDimensions } = blueNoiseLib(config)
              expect(gridDimensions).toBeDefined()
            }
          )
        )
      })
      it('should be the same as the given config.dimensions mapped by n => Math.ceil(n / cellSize)', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { dimensions, gridDimensions, cellSize } = blueNoiseLib(config)
              expect(gridDimensions).toStrictEqual(dimensions.map(n => Math.ceil(n / cellSize)))
            }
          )
        )
      })
    })
    describe('gridCoordinates', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { gridCoordinates } = blueNoiseLib(config)
              expect(gridCoordinates).toBeDefined()
            }
          )
        )
      })
      it('should be a function that converts the given regular position into a valid grid coordinate index', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbPos(config.dimensions)
                    .map(pos => [config, pos])
              ),
            ([config, position]) => {
              const { gridCoordinates, gridDimensions } = blueNoiseLib(config)
              expect(zip(gridDimensions, gridCoordinates(position))).toSatisfyAll(([dim, idx]) => idx < dim)
            }
          )
        )
      })
    })
    describe('inBounds', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { inBounds } = blueNoiseLib(config)
              expect(inBounds).toBeDefined()
            }
          )
        )
      })
      it('should be a function that checks if the given position is within the bounds of the supplied dimensions', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  fc.tuple(
                    ...config.dimensions.map(
                      d => fc.float({ noDefaultInfinity: true, noNaN: true })
                    )
                  )
                    .map(pos => [config, pos])
              ),
            ([config, position]) => {
              const { dimensions, inBounds } = blueNoiseLib(config)
              const isInBounds = position.every((coord, idx) => coord >= 0 && coord <= dimensions[idx])
              expect(inBounds(position)).toBe(isInBounds)
            }
          )
        )
      })
    })
    describe('initPos', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { initPos } = blueNoiseLib(config)
              expect(initPos).toBeDefined()
            }
          )
        )
      })
      it('should be a Generator that returns a position in-bounds of the config.dimensions', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            arbSeed(),
            arbSeed(),
            (config, seed1, seed2) => {
              fc.pre(seed1 !== seed2)
              const { initPos, inBounds } = blueNoiseLib(config)
              expect(initPos).toBeInstanceOf(Generator)
              const pos1 = initPos(seed1)
              const pos2 = initPos(seed2)
              expect(initPos(seed1)).toStrictEqual(pos1)
              expect(pos2).not.toStrictEqual(pos1)
              expect(pos1[0]).toSatisfy(inBounds)
              expect(pos2[0]).toSatisfy(inBounds)
            }
          )
        )
      })
    })
    describe('initState', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { initState } = blueNoiseLib(config)
              expect(initState).toBeDefined()
            }
          )
        )
      })
      it('should be a function that returns the initial state for the blue noise function when given an initial position', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbPos(config.dimensions)
                    .map(pos => [config, pos])
              ),
            ([config, position]) => {
              const { initState, n, gridDimensions, gridCoordinates } = blueNoiseLib(config)
              const { active, samples, grid } = initState(position)

              expect(active).toSatisfy(List.isList)
              expect(active.size).toBe(1)
              expect(active.get(0)).toStrictEqual(0)

              expect(samples).toSatisfy(List.isList)
              expect(samples.size).toBe(1)
              expect(samples.get(0)).toStrictEqual(position)

              expect(grid).toSatisfy(List.isList)
              expect(gridDepth(grid)).toBe(n)
              expect([gridDimensions, grid]).toSatisfy(([dimensions, grd]) => checkGridDimensions(dimensions, grd))
              expect(grid.getIn(gridCoordinates(position))).toBe(0)
              expect(grid.setIn(gridCoordinates(position), -1).flatten(false).toJS()).toSatisfyAll(n => n === -1)
            }
          )
        )
      })
    })
    describe('generateActivePosition', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { generateActivePosition } = blueNoiseLib(config)
              expect(generateActivePosition).toBeDefined()
            }
          )
        )
      })
      it('should be a Generator constructor', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbState(blueNoiseLib(config))
                    .map(state => [config, state])
              ),
            arbSeed(),
            arbSeed(),
            ([config, state], seed1, seed2) => {
              fc.pre(seed1 !== seed2)
              const { generateActivePosition } = blueNoiseLib(config)
              const activePosition = generateActivePosition(state)
              expect(activePosition).toBeInstanceOf(Generator)
              const activePos1 = activePosition(seed1)
              expect(activePosition(seed1)).toStrictEqual(activePos1)
              const activePos2 = activePosition(seed2)
              expect(activePos2).not.toStrictEqual(activePos1)
            }
          )
        )
      })
      it('should return a Generator that chooses a random active sample from the current state', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbState(blueNoiseLib(config))
                    .map(state => [config, state])
              ),
            arbSeed(),
            ([config, state], seed) => {
              const { generateActivePosition } = blueNoiseLib(config)
              const activePosition = generateActivePosition(state)
              const [{ curIdx, curPos }, nextSeed] = activePosition(seed)
              expect(curIdx).toBeLessThan(state.active.size)
              expect(curPos).toStrictEqual(state.samples.get(state.active.get(curIdx)))
              expect(nextSeed).not.toBe(seed)
            }
          )
        )
      })
    })
    describe('generateCandidateAroundOrigin', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { generateCandidateAroundOrigin } = blueNoiseLib(config)
              expect(generateCandidateAroundOrigin).toBeDefined()
            }
          )
        )
      })
      it('should be a Generator that returns the same result as sphericalAnnulus({ dimensions: n, innerRadius: radius, outerRadius: radius * 2 })', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            arbSeed(),
            arbSeed(),
            (config, seed1, seed2) => {
              fc.pre(seed1 !== seed2)
              const { n, radius, generateCandidateAroundOrigin } = blueNoiseLib(config)
              expect(generateCandidateAroundOrigin).toBeInstanceOf(Generator)
              const blueLibResult1 = generateCandidateAroundOrigin(seed1)
              expect(generateCandidateAroundOrigin(seed1)).toStrictEqual(blueLibResult1)
              const blueLibResult2 = generateCandidateAroundOrigin(seed2)
              expect(blueLibResult2).not.toStrictEqual(blueLibResult1)

              const genSphericalAnnulus = sphericalAnnulus({ dimensions: n, innerRadius: radius, outerRadius: radius * 2 })
              const sphereAnnResult1 = genSphericalAnnulus(seed1)
              expect(blueLibResult1).toStrictEqual(sphereAnnResult1)
              const sphereAnnResult2 = genSphericalAnnulus(seed2)
              expect(blueLibResult2).toStrictEqual(sphereAnnResult2)
            }
          )
        )
      })
    })
    describe('generateCandidateAround', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { generateCandidateAround } = blueNoiseLib(config)
              expect(generateCandidateAround).toBeDefined()
            }
          )
        )
      })
      it('should be a Generator constructor', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbPos(config.dimensions)
                    .map(pos => [config, pos])
              ),
            arbSeed(),
            arbSeed(),
            ([config, pos], seed1, seed2) => {
              fc.pre(seed1 !== seed2)
              const { generateCandidateAround } = blueNoiseLib(config)
              const gen = generateCandidateAround(pos)
              expect(gen).toBeInstanceOf(Generator)
              const cand1 = gen(seed1)
              expect(gen(seed1)).toStrictEqual(cand1)
              const cand2 = gen(seed2)
              expect(cand2).not.toStrictEqual(cand1)
            }
          )
        )
      })
      it('should be a Generator that returns the same result as generateCandidateAroundOrigin offset by the given position)', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbPos(config.dimensions)
                    .map(pos => [config, pos])
              ),
            arbSeed(),
            arbSeed(),
            ([config, pos], seed1, seed2) => {
              fc.pre(seed1 !== seed2)
              const { generateCandidateAroundOrigin, generateCandidateAround } = blueNoiseLib(config)
              const genOrigin = generateCandidateAroundOrigin
              const genAround = generateCandidateAround(pos)
              const posDistance = distance(pos.map(() => 0), pos)
              const epsilon = (config.radius * 2) * 1e-12
              const [origin1] = genOrigin(seed1)
              const [around1] = genAround(seed1)
              expect(around1).toStrictEqual(zipWith((a, b) => a + b, pos, origin1))
              const [origin2] = genOrigin(seed2)
              const [around2] = genAround(seed2)
              expect(around2).toStrictEqual(zipWith((a, b) => a + b, pos, origin2))
              expect(List(around1).equals(List(around2))).toBe(List(origin1).equals(List(origin2)))
              expect(distance(around1, pos)).toBeWithin(config.radius, config.radius * 2)
              expect(distance(around1, origin1)).toBeWithin(posDistance - epsilon, posDistance + epsilon)
              expect(distance(around2, pos)).toBeWithin(config.radius, config.radius * 2)
              expect(distance(around2, origin2)).toBeWithin(posDistance - epsilon, posDistance + epsilon)
            }
          )
        )
      })
    })
    describe('permute', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { permute } = blueNoiseLib(config)
              expect(permute).toBeDefined()
            }
          )
        )
      })
    })
    describe('neighbors', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { neighbors } = blueNoiseLib(config)
              expect(neighbors).toBeDefined()
            }
          )
        )
      })
    })
    describe('distance2', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { distance2 } = blueNoiseLib(config)
              expect(distance2).toBeDefined()
            }
          )
        )
      })
      it('should return the square of the distance between its arguments', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(config => fc.tuple(fc.constant(config), arbPos(config.dimensions), arbPos(config.dimensions))),
            ([config, pos1, pos2]) => {
              const lib = blueNoiseLib(config)
              const epsilon = Math.max(Math.max(...pos1), Math.max(...pos2)) * 1e-12
              const expectedDistance = distance2(pos1, pos2)
              const actualDistance = lib.distance2(pos1, pos2)
              expect(actualDistance).toBeGreaterThanOrEqual(expectedDistance - epsilon)
              expect(actualDistance).toBeLessThanOrEqual(expectedDistance + epsilon)
            }
          )
        )
      })
    })
    describe('near', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { near } = blueNoiseLib(config)
              expect(near).toBeDefined()
            }
          )
        )
      })
      it('should return true if the given position is within config.radius of any positions maintained in the samples List, and false otherwise', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbState(blueNoiseLib(config))
                    .map(state => [config, state])
              )
              .chain(
                ([config, state]) =>
                  arbPos(config.dimensions)
                    .map(pos => [config, state, pos])
              ),
            ([config, state, pos]) => {
              const { near } = blueNoiseLib(config)
              expect(near(state)(pos)).toBe(state.samples.some(smp => distance(pos, smp) < config.radius))
            }
          )
        )
      })
    })
    describe('emitSample', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { emitSample } = blueNoiseLib(config)
              expect(emitSample).toBeDefined()
            }
          )
        )
      })
    })
    describe('removeActiveIndex', () => {
      it('should be defined', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig(),
            config => {
              const { removeActiveIndex } = blueNoiseLib(config)
              expect(removeActiveIndex).toBeDefined()
            }
          )
        )
      })
      it('should remove the given index from the state.active list', () => {
        fc.assert(
          fc.property(
            arbBlueNoiseConfig()
              .chain(
                config =>
                  arbState(blueNoiseLib(config))
                    .chain(
                      state =>
                        fc.nat(state.active.size - 1)
                          .map(idx => [config, state, idx])
                    )
              ),
            ([config, state, idx]) => {
              const { removeActiveIndex } = blueNoiseLib(config)
              const { active, grid, samples } = removeActiveIndex(state)(idx)
              expect(grid).toBe(state.grid)
              expect(samples).toBe(state.samples)
              if (state.active.size > 0) {
                expect(active.size).toBe(state.active.size - 1)
              }
              if (idx < state.active.size - 1) {
                expect(active.get(idx)).toBe(state.active.get(idx + 1))
              }
            }
          )
        )
      })
    })
  })
})

describe('The blueNoise function', () => {
  it('should be defined', () => {
    expect(blueNoise).toBeDefined()
  })
  shouldBeAGeneratorConstructor(arbBlueNoise)
  it('should return a list of sampled points less than the maximum numbr of possible samples (based on lib.gridDimensions)', () => {
    fc.assert(
      fc.property(
        arbBlueNoiseLib(),
        arbSeed(),
        (lib, seed) => {
          const maxSamples = lib.gridDimensions.reduce((a, b) => a * b, 1)
          // const minSamples = Math.floor(Math.sqrt(maxSamples / lib.n) - 1)
          const [samples, nextSeed] = blueNoise(lib)(seed)
          expect(nextSeed).not.toBe(seed)
          // expect(samples.size).toBeGreaterThanOrEqual(minSamples)
          expect(samples.size).toBeLessThanOrEqual(maxSamples)
        }
      )
    )
  })
  it('should return a list of sampled points where for any two samples, their distance is greater than or equal to lib.radius', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          arbBlueNoiseLib(),
          arbSeed()
        )
          .map(([lib, seed]) => [lib, blueNoise(lib)(seed)[0]])
          .filter(([lib, samples]) => samples.size > 1)
          .chain(
            ([lib, samples]) =>
              fc.tuple(
                fc.nat(samples.size - 1),
                fc.nat(samples.size - 1)
              )
                .filter(([i, j]) => i !== j)
                .map(([i, j]) => [lib, samples.get(i), samples.get(j)])
          ),
        ([lib, sample1, sample2]) => {
          expect(distance(sample1, sample2)).toBeGreaterThanOrEqual(lib.radius)
        }
      )
    )
  })
})
