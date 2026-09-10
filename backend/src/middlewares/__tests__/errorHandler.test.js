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
	});

	afterEach(() => {
		console.error.mockRestore();
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

	it("logs error stack", () => {
		const err = new Error("Test error");

		errorHandler(err, req, res, next);

		expect(console.error).toHaveBeenCalledWith(err.stack);
	});
});
