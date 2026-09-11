/** @format */

const logger = require("../logger");

describe("Logger Middleware", () => {
	let req;
	let res;
	let next;
	let finishHandlers;

	beforeEach(() => {
		finishHandlers = [];
		req = {
			method: "GET",
			url: "/api/health?token=secret",
		};
		res = {
			// Minimal event emitter stub for the "finish" event.
			on: jest.fn((event, handler) => {
				if (event === "finish") {
					finishHandlers.push(handler);
				}
			}),
			statusCode: 200,
		};
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

	it("logs method, path without query string, status, and duration on finish", () => {
		logger(req, res, next);

		// Simulate the response finishing.
		finishHandlers.forEach((handler) => handler());

		expect(console.log).toHaveBeenCalledTimes(1);
		const logOutput = console.log.mock.calls[0][0];
		expect(logOutput).toContain("GET");
		expect(logOutput).toContain("/api/health");
		// Query strings must never be logged (they can carry tokens).
		expect(logOutput).not.toContain("token=secret");
		expect(logOutput).toContain("200");
		expect(logOutput).toMatch(/\d+(\.\d+)?ms/);
	});

	it("includes timestamp in ISO format", () => {
		logger(req, res, next);

		finishHandlers.forEach((handler) => handler());

		const logOutput = console.log.mock.calls[0][0];
		const timestampMatch = logOutput.match(
			/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/,
		);
		expect(timestampMatch).toBeTruthy();
	});

	it("does not log before the response finishes", () => {
		logger(req, res, next);

		expect(console.log).not.toHaveBeenCalled();
	});
});
