import { fromJS, List, Range } from 'immutable'
import * as R from 'ramda'
import { flatMap, map, tuple } from '../combinators'
import { Generator } from '../Generator'
import { nat } from './nat'
import { number } from './number'
import { sphericalAnnulus } from './sphericalAnnulus'

// adapted from https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf

export const blueNoiseLib = ({ dimensions, padding = 0, radius, samples }) => {
  const n = dimensions.length
  const radius2 = radius * radius
  const sqrtN = Math.sqrt(n)
  const cellSize = radius / sqrtN
  const gridDimensions = dimensions.map(dimension => Math.ceil(dimension / cellSize))

  const gridCoordinates =
    pos =>
      pos.map(num => Math.floor(num / cellSize))

  const inBounds =
    pos =>
      pos.every((n, i) => n >= 0 + padding && n <= dimensions[i] - padding)

  const initPos =
    tuple(dimensions.map(n => number({ min: 0 + padding, max: n - padding })))

  const initState =
    pos => ({
      active: List([0]),
      samples: List([pos]),
      grid: fromJS(
        gridDimensions.reduceRight(
          (acc, next) =>
            new Array(next).fill(
              acc === -1
                ? acc
                : [...acc]
            ),
          -1
        )
      ).setIn(gridCoordinates(pos), 0)
    })

  const generateActivePosition =
    ({ active, samples }) =>
      map(
        idx => ({
          curIdx: idx,
          curPos: samples.get(active.get(idx))
        }),
        nat(active.size)
      )

  const generateCandidateAroundOrigin =
    sphericalAnnulus({ dimensions: n, innerRadius: radius, outerRadius: 2 * radius })

  const generateCandidateAround =
    position =>
      map(
        candidate =>
          R.zipWith((a, b) => a + b, position, candidate),
        generateCandidateAroundOrigin
      )

  const permute =
    optionLists =>
      optionLists.reduce(
        (permutations, nextOptionList) =>
          permutations
            .map(
              permutation =>
                nextOptionList
                  .map(option => [...permutation, option])
            )
            .reduce((lsa, lsb) => [...lsa, ...lsb]),
        [[]]
      )

  const neighbors =
    ({ grid, samples }) =>
      gridIndex =>
        permute(
          gridIndex
            .map((idx, d) => Range(Math.max(idx - n, 0), Math.min(idx + n + 1, gridDimensions[d])).toJS())
        )
          .map(coordinates => grid.getIn(coordinates))
          .filter(idx => idx !== -1)
          .map(idx => samples.get(idx))

  const distance2 =
    R.pipe(
      R.zipWith((a, b) => Math.pow(b - a, 2)),
      R.sum
    )

  const near =
    ({ grid, samples }) =>
      pos => {
        const gridIndex = gridCoordinates(pos)
        return (
          grid.getIn(gridIndex) !== -1 ||
          neighbors({ grid, samples })(gridIndex)
            .some(sample => distance2(pos, sample) < radius2)
        )
      }

  const emitSample =
    ({ samples, active, grid }) =>
      pos => ({
        samples: samples.push(pos),
        active: active.push(samples.size),
        grid: grid.setIn(gridCoordinates(pos), samples.size)
      })

  const removeActiveIndex =
    ({ active, ...state }) =>
      idx => ({
        ...state,
        active: active.delete(idx)
      })

  return {
    dimensions,
    radius,
    samples,
    n,
    radius2,
    sqrtN,
    cellSize,
    gridDimensions,
    gridCoordinates,
    inBounds,
    initPos,
    initState,
    generateActivePosition,
    generateCandidateAroundOrigin,
    generateCandidateAround,
    permute,
    neighbors,
    distance2,
    near,
    emitSample,
    removeActiveIndex
  }
}

/** const poisson: config => State RNG [[x, y]] */
export const blueNoise = (config) => {
  const {
    samples,
    inBounds,
    initPos,
    initState,
    generateActivePosition,
    generateCandidateAround,
    near,
    emitSample,
    removeActiveIndex
  } = blueNoiseLib(config)

  return flatMap(
    (state) => Generator(
      seed => {
        let currentSeed = seed
        let currentState = state
        while (currentState.active.size > 0) {
          const [{ curIdx, curPos }, idxSeed] = generateActivePosition(currentState)(currentSeed)
          currentSeed = idxSeed
          let count
          for (count = 0; count < samples; count++) {
            const [nextCandidate, nextSeed] = generateCandidateAround(curPos)(currentSeed)
            currentSeed = nextSeed
            if (inBounds(nextCandidate) && !near(currentState)(nextCandidate)) {
              currentState = emitSample(currentState)(nextCandidate)
              break
            }
          }
          if (count >= samples) {
            currentState = removeActiveIndex(currentState)(curIdx)
          }
        }
        return [currentState.samples.toJS(), currentSeed]
      }
    ),
    map(initState, initPos)
  )
}
