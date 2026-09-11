/** @format */

const securityHeaders = require("../security");

describe("Security Headers Middleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		req = {};
		res = {
			setHeader: jest.fn(),
			removeHeader: jest.fn(),
		};
		next = jest.fn();
	});

	it("sets all expected security headers", () => {
		securityHeaders(req, res, next);

		expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
		expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
		expect(res.setHeader).toHaveBeenCalledWith("X-DNS-Prefetch-Control", "off");
		expect(res.setHeader).toHaveBeenCalledWith("Referrer-Policy", "no-referrer");
		expect(res.setHeader).toHaveBeenCalledWith(
			"Cross-Origin-Opener-Policy",
			"same-origin",
		);
		expect(res.setHeader).toHaveBeenCalledWith(
			"Cross-Origin-Resource-Policy",
			"same-site",
		);
	});

	it("removes X-Powered-By header", () => {
		securityHeaders(req, res, next);

		expect(res.removeHeader).toHaveBeenCalledWith("X-Powered-By");
	});

	it("calls next()", () => {
		securityHeaders(req, res, next);

		expect(next).toHaveBeenCalled();
	});
});
