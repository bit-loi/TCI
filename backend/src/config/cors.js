/** @format */

/**
 * Parses CORS_ORIGINS env variable into an allowlist.
 * Accepts comma-separated values and tolerates stray whitespace and trailing slashes.
 * Empty/undefined yields an empty list: with credentials disabled, `origin: false`
 * simply means "no cross-origin origin is allowed", which is the safe default.
 */
const parseAllowedOrigins = (rawOrigins) => {
	if (!rawOrigins) {
		return [];
	}
	return rawOrigins
		.split(",")
		.map((origin) => origin.trim().replace(/\/$/, ""))
		.filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGINS);

const corsOptions = {
	// Reflect the request origin only when it is in the allowlist; otherwise do not
	// set the CORS header so the browser blocks the response.
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		return callback(null, false);
	},
	// The API uses Bearer tokens, not cookies, so credentials stay disabled.
	// This also prevents cached responses keyed on a wildcard origin.
	credentials: false,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	maxAge: 86400,
};

module.exports = { corsOptions, allowedOrigins, parseAllowedOrigins };
