module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/helpers/',
    '<rootDir>/tests/config/',
    '<rootDir>/tests/fixtures/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/config/setup.js'],
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}'
  ],
  coverageDirectory: '<rootDir>/tests/coverage',
  coverageReporters: ['text', 'lcov', 'html']
};