import type { Config } from 'jest'
import { defaults } from 'jest-config'

/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const config: Config = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  coverageReporters: [
    ...defaults.coverageReporters,
    'html'
  ],

  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '/__utils__/'
  ]
}

export default config