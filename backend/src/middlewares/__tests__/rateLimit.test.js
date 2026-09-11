/** @format */

const { rateLimit, getClientIp, resetRateLimit } = require("../rateLimit");

describe("Rate Limit Middleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		jest.useFakeTimers();
		resetRateLimit();
		req = {
			headers: {},
			ip: "10.0.0.1",
			path: "/api/health",
		};
		res = {
			setHeader: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("allows requests under the limit", () => {
		const middleware = rateLimit({ windowMs: 60000, max: 3 });

		middleware(req, res, next);
		middleware(req, res, next);
		middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(3);
		expect(res.status).not.toHaveBeenCalled();
	});

	it("blocks requests over the limit with 429", () => {
		const middleware = rateLimit({ windowMs: 60000, max: 2 });

		middleware(req, res, next);
		middleware(req, res, next);
		middleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(429);
		expect(res.json).toHaveBeenCalledWith({
			error: "Too many requests, please try again later",
		});
		expect(next).toHaveBeenCalledTimes(2);
	});

	it("sets Retry-After when blocked", () => {
		const middleware = rateLimit({ windowMs: 60000, max: 1 });

		middleware(req, res, next);
		middleware(req, res, next);

		expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(Number));
	});

	it("resets the window after it expires", () => {
		const middleware = rateLimit({ windowMs: 60000, max: 1 });

		middleware(req, res, next);
		middleware(req, res, next);
		expect(res.status).toHaveBeenCalledWith(429);

		jest.advanceTimersByTime(61000);
		middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(2);
	});

	it("tracks different paths and IPs separately", () => {
		const middleware = rateLimit({ windowMs: 60000, max: 1 });

		middleware(req, res, next);

		const otherPathReq = { ...req, path: "/api/other" };
		middleware(otherPathReq, res, next);

		expect(next).toHaveBeenCalledTimes(2);
	});

	it("prefers X-Forwarded-For when present", () => {
		const forwardedReq = {
			...req,
			headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.2" },
		};

		expect(getClientIp(forwardedReq)).toBe("203.0.113.7");
	});
});
