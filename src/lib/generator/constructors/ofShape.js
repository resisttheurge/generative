import { map } from 'ramda'

import { record, tuple } from '../combinators'
import { isGenerator } from '../Generator'
import { constant } from './constant'

export const ofShape =
  (config = {}) =>
    isGenerator(config)
      ? config
      : Array.isArray(config)
        ? tuple(map(ofShape, config))
        : typeof config === 'object' && config !== null
          ? record(map(ofShape, config))
          : constant(config)
