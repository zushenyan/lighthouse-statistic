module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/bin/'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
};
