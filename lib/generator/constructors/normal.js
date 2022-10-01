import { take } from 'ramda'
import { filter, map, repeat, tuple } from '../combinators'

import { uniform } from '../instances/uniform'

// normal distribution function,
// taken from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Implementation

const TWO_PI = Math.PI * 2

export const normal =
  ({ mu = 0, sigma = 1, count = 2 } = {}) =>
    map(
      ([pair, ...pairs]) => take(count, pair.concat(...pairs)),
      repeat(
        Math.ceil(count / 2),
        map(
          ([u1, u2]) => {
            const mag = sigma * Math.sqrt(-2.0 * Math.log(u1))
            const z0 = mag * Math.cos(TWO_PI * u2) + mu
            const z1 = mag * Math.sin(TWO_PI * u2) + mu
            return [z0, z1]
          },
          tuple([
            filter(
              u => u > Number.EPSILON,
              uniform
            ),
            uniform
          ])
        )
      )
    )
