module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage/',
  collectCoverageFrom: [
    'store',
    'pages',
    'middleware',
    'trifid',
    'api',
    'plugins',
    'libs'
  ],
  testPathIgnorePatterns: ['api/.*/.*', 'test/fixtures/.*/.*?/'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js', 'json'],
  expand: true,
  forceExit: true
  // https://github.com/facebook/jest/pull/6747 fix warning here
  // But its performance overhead is pretty bad (30+%).
  // detectOpenHandles: true
}
