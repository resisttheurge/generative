import { curry } from 'ramda'
import invariant from 'tiny-invariant'

export interface Range {
  min: number
  max: number
}

export interface RangeConfig {
  finite: boolean
  nonempty: boolean
  polarity: 'positive' | 'negative' | 'bipolar' | false
}

export const validate = (range: Range, config: Partial<RangeConfig> = {}): void => {
  const { min, max } = range
  invariant(!isNaN(min), `min (${min}) must be a number`)
  invariant(min <= max, `min (${min}) must be less than or equal to max (${max})`)
  invariant(!isNaN(max), `max (${max}) must be a number`)
  invariant(max >= min, `max (${max}) must be greater than or equal to min (${min})`)

  const { finite = false, nonempty = false, polarity = false } = config
  if (finite) {
    invariant(min > -Infinity && min < Infinity, `min (${min}) must be finite`)
    invariant(max > -Infinity && max < Infinity, `max (${max}) must be finite`)
  }
  if (nonempty) {
    invariant(min !== max, `min (${min}) must not equal max (${max})`)
  }
  switch (polarity) {
    case false:
      break
    case 'positive':
      invariant(min >= 0, `min (${min}) must be positive`)
      break
    case 'negative':
      invariant(max <= 0, `max (${max}) must be negative`)
      break
    case 'bipolar':
      invariant(min <= 0, `min (${min}) must be negative`)
      invariant(max >= 0, `max (${max}) must be positive`)
      break
  }
}

export const isEmpty = (range: Range): boolean => {
  validate(range)
  return range.min === range.max
}

export const inRange = curry((range: Range, n: number): boolean => {
  validate(range)
  return n >= range.min && n <= range.max
})

export const toString = ({ min, max }: Range): string => `[${min}, ${max}]`

export const clamp = curry((range: Range, n: number): number => {
  validate(range)
  return isEmpty(range)
    ? range.min
    : Math.min(Math.max(n, range.min), range.max)
})

export const midpoint = (range: Range): number => {
  validate(range, { finite: true })
  return isEmpty(range)
    ? range.min
    : (range.min + range.max) / 2
}

export const split = (range: Range, n?: number): [Range, Range] => {
  validate(range)
  const splitPoint = n === undefined ? midpoint(range) : n
  invariant(inRange(range, splitPoint), `split point n (${splitPoint}) must be in range (${toString(range)})`)
  return isEmpty(range)
    ? [range, range]
    : [{ min: range.min, max: splitPoint }, { min: splitPoint, max: range.max }]
}

export const subdivide = (range: Range, count: number): Range[] => {
  validate(range, { finite: true })
  invariant(count >= 1, `count (${count}) must be 1 or greater`)
  invariant(count % 1 === 0, `count (${count}) must be an integer`)
  if (count === 1) return [range]
  else if (count === 2) return split(range)
  else if (count % 2 === 0) return split(range).map(r => subdivide(r, count / 2)).flat()
  else if (isEmpty(range)) return new Array(count).fill(range)
  else {
    const step = (range.max - range.min) / count
    const result = []
    for (let i = 0; i < count; i++) {
      result.push({
        min: i * step + range.min,
        max: i + 1 < count
          ? (i + 1) * step + range.min
          : range.max
      })
    }
    return result
  }
}
