module.exports = {
  clearMocks: true,
  coverageDirectory: '__tests__/coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
};
