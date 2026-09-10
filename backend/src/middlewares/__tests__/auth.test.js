/** @format */

const authMiddleware = require("../auth");

jest.mock("../../config/supabase", () => ({
	supabase: {
		auth: {
			getUser: jest.fn(),
		},
	},
}));

const { supabase } = require("../../config/supabase");

describe("Auth Middleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		req = { headers: {} };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	it("returns 401 when no authorization header", async () => {
		await authMiddleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Unauthorized: No token provided",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when authorization header does not start with Bearer", async () => {
		req.headers.authorization = "Basic abc123";

		await authMiddleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Unauthorized: No token provided",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when token is invalid", async () => {
		req.headers.authorization = "Bearer invalid-token";
		supabase.auth.getUser.mockResolvedValue({
			data: { user: null },
			error: { message: "Invalid token" },
		});

		await authMiddleware(req, res, next);

		expect(supabase.auth.getUser).toHaveBeenCalledWith("invalid-token");
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Unauthorized: Invalid token",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when no user is returned", async () => {
		req.headers.authorization = "Bearer valid-token";
		supabase.auth.getUser.mockResolvedValue({
			data: { user: null },
			error: null,
		});

		await authMiddleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next and sets req.user for valid token", async () => {
		const mockUser = { id: "user-123", email: "test@example.com" };
		req.headers.authorization = "Bearer valid-token";
		supabase.auth.getUser.mockResolvedValue({
			data: { user: mockUser },
			error: null,
		});

		await authMiddleware(req, res, next);

		expect(req.user).toEqual(mockUser);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});
});
