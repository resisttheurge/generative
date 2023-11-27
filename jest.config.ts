import { defaults } from 'jest-config'
import { pathsToModuleNameMapper } from 'ts-jest'
import type { JestConfigWithTsJest } from 'ts-jest'

const { compilerOptions } = require('./tsconfig.json')

/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const config: JestConfigWithTsJest = {
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

  moduleDirectories: [...defaults.moduleDirectories, compilerOptions.baseUrl],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),

  roots: ['<rootDir>/src'],

  setupFilesAfterEnv: [
    'jest-extended/all',
    '<rootDir>/jest.setup.ts'
  ],

  showSeed: true,

  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },

  testPathIgnorePatterns: [
    '/node_modules/'
  ]
}

export default config
