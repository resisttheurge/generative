/* eslint-env jest */

import fc from 'fast-check'

import * as index from './index'
import { filter } from './filter'
import { flatMap } from './flatMap'
import { flatten } from './flatten'
import { map } from './map'
import { oneOf } from './oneOf'
import { record } from './record'
import { repeat } from './repeat'
import { tuple } from './tuple'

describe('the generator/combinators/index.js module', () => {
  it('should export these members of filter.js: { filter }', () => {
    expect(index.filter).toBeDefined()
    expect(index.filter).toBe(filter)
  })
  it('should export these members of flatMap.js: { flatMap }', () => {
    expect(index.flatMap).toBeDefined()
    expect(index.flatMap).toBe(flatMap)
  })
  it('should export these members of flatten.js: { flatten }', () => {
    expect(index.flatten).toBeDefined()
    expect(index.flatten).toBe(flatten)
  })
  it('should export these members of map.js: { map }', () => {
    expect(index.map).toBeDefined()
    expect(index.map).toBe(map)
  })
  it('should export these members of oneOf.js: { oneOf }', () => {
    expect(index.oneOf).toBeDefined()
    expect(index.oneOf).toBe(oneOf)
  })
  it('should export these members of record.js: { record }', () => {
    expect(index.record).toBeDefined()
    expect(index.record).toBe(record)
  })
  it('should export these members of repeat.js: { repeat }', () => {
    expect(index.repeat).toBeDefined()
    expect(index.repeat).toBe(repeat)
  })
  it('should export these members of tuple.js: { tuple }', () => {
    expect(index.tuple).toBeDefined()
    expect(index.tuple).toBe(tuple)
  })
})
