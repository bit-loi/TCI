/** @format */

const { supabase } = require("../config/supabase");

/**
 * Wraps an async middleware so rejected promises reach the Express error
 * handler instead of crashing the request or hanging the response.
 */
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

const authMiddleware = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	// Guard the header format before touching Supabase: malformed or oversized
	// tokens should never reach the auth service.
	const token = authHeader.slice("Bearer ".length).trim();
	if (!token || token.length > 4096) {
		return res.status(401).json({ error: "Unauthorized: Malformed token" });
	}

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser(token);

	if (error || !user) {
		return res.status(401).json({ error: "Unauthorized: Invalid token" });
	}

	req.user = user;
	return next();
});

module.exports = authMiddleware;
module.exports.asyncHandler = asyncHandler;
