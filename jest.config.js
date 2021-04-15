process.env.TZ = 'GMT'
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false
    },
    __DEV__: false
  },
  setupFiles: ['<rootDir>/scripts/jest/setup-file.js', 'fake-indexeddb/auto', 'jest-canvas-mock'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/framework/app/App.tsx',
    '!src/framework/AppStore/AppStoreContext.tsx',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/services/**',
    '!src/**/YamlBuilder.tsx',
    '!src/**/*mock*.{ts,tsx}',
    '!src/**/*Mock*.{ts,tsx}',
    '!src/**/CreateConnectorFromYamlPage.tsx',
    '!src/**/CreateSecretFromYamlPage.tsx',
    '!src/**/PipelineYamlView.tsx',
    '!src/**/RouteDestinations.tsx',
    '!src/modules/10-common/RouteDefinitions.ts',
    '!src/modules/10-common/utils/testUtils.tsx',
    '!src/modules/10-common/utils/JestFormHelper.ts',
    '!src/modules/85-cv/pages/metric-pack/**'
  ],
  coverageReporters: ['lcov', 'json-summary'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
    '^.+\\.ya?ml$': '<rootDir>/scripts/jest/yaml-transform.js'
  },
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '\\.s?css$': 'identity-obj-proxy',
    'monaco-editor': '<rootDir>/node_modules/react-monaco-editor',
    '\\.(jpg|jpeg|png|gif|svg|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/scripts/jest/file-mock.js',
    ...pathsToModuleNameMapper(compilerOptions.paths)
  },
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 40,
      functions: 40,
      lines: 60
    }
  },
  transformIgnorePatterns: ['node_modules/(?!(date-fns|lodash-es|p-debounce)/)']
}
