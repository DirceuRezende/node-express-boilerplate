module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts?'],
  modulePaths: ['<rootDir>/src/', '<rootDir>/.jest']
}
