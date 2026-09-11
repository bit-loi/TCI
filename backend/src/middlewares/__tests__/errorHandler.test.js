/** @format */

const errorHandler = require("../errorHandler");

describe("Error Handler Middleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(console, "warn").mockImplementation(() => {});
		delete process.env.NODE_ENV;
	});

	afterEach(() => {
		console.error.mockRestore();
		console.warn.mockRestore();
	});

	it("returns 500 for generic errors", () => {
		const err = new Error("Something went wrong");

		errorHandler(err, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Something went wrong",
		});
	});

	it("returns custom status code when provided", () => {
		const err = new Error("Not Found");
		err.status = 404;

		errorHandler(err, req, res, next);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			error: "Not Found",
		});
	});

	it("falls back to 500 for malformed status values", () => {
		const err = new Error("Weird");
		err.status = "abc";

		errorHandler(err, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("hides internal error message in production for 5xx", () => {
		process.env.NODE_ENV = "production";
		const err = new Error("Database connection leaked");

		errorHandler(err, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Internal Server Error",
		});
	});

	it("logs error stack for 5xx via console.error", () => {
		const err = new Error("Test error");

		errorHandler(err, req, res, next);

		expect(console.error).toHaveBeenCalled();
		const logged = console.error.mock.calls[0].join(" ");
		expect(logged).toContain(err.stack);
	});

	it("logs client errors via console.warn without stack", () => {
		const err = new Error("Bad request");
		err.status = 400;

		errorHandler(err, req, res, next);

		expect(console.warn).toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});
});
