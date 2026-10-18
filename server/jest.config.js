export default {
  testEnvironment: "node",
  transform: {},
  globalSetup: "./tests/globalSetup.js",
  setupFiles: ["./tests/testEnv.js"],
  setupFilesAfterEnv: ["./tests/closePool.js"],
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["text-summary", "text", "lcov"],
};
