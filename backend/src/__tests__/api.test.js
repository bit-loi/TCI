/** @format */

jest.mock("../config/supabase", () => ({
	supabase: {
		auth: {
			getUser: jest.fn(),
		},
	},
}));

const { supabase } = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");

describe("Auth API Integration", () => {
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

	describe("GET /api/auth/me", () => {
		it("returns user data for authenticated request", async () => {
			const mockUser = {
				id: "user-123",
				email: "test@example.com",
				user_metadata: { full_name: "Test User" },
			};

			req.headers.authorization = "Bearer valid-token";
			supabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			await authMiddleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(req.user).toEqual(mockUser);
		});

		it("rejects unauthenticated request", async () => {
			await authMiddleware(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});
	});
});
