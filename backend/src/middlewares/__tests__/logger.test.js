/** @format */

const logger = require("../logger");

describe("Logger Middleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		req = {
			method: "GET",
			url: "/api/health",
		};
		res = {};
		next = jest.fn();
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		console.log.mockRestore();
	});

	it("calls next()", () => {
		logger(req, res, next);

		expect(next).toHaveBeenCalled();
	});

	it("logs method and url", () => {
		logger(req, res, next);

		expect(console.log).toHaveBeenCalledTimes(1);
		const logOutput = console.log.mock.calls[0][0];
		expect(logOutput).toContain("GET");
		expect(logOutput).toContain("/api/health");
	});

	it("includes timestamp in ISO format", () => {
		logger(req, res, next);

		const logOutput = console.log.mock.calls[0][0];
		const timestampMatch = logOutput.match(
			/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/,
		);
		expect(timestampMatch).toBeTruthy();
	});
});
