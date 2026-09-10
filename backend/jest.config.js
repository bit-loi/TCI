/** @format */

/** @type {import('jest').Config} */
module.exports = {
	testMatch: ["**/__tests__/**/*.test.js"],
	testEnvironment: "node",
	verbose: true,
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: "coverage",
	collectCoverageFrom: ["src/**/*.js", "!src/index.js"],
	coverageThreshold: {
		global: {
			branches: 10,
			functions: 10,
			lines: 10,
			statements: 10,
		},
	},
};
