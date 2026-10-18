export default {
  testEnvironment: "node",
  transform: {},
  globalSetup: "./tests/globalSetup.js",
  setupFiles: ["./tests/testEnv.js"],
  setupFilesAfterEnv: ["./tests/closePool.js"],
  coverageProvider: "v8",
  // The OpenAPI spec is data, so it is left out of the coverage figure
  collectCoverageFrom: ["src/**/*.js", "!src/docs/**"],
  coverageReporters: ["text-summary", "text", "lcov"],
};
