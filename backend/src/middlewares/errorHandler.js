/** @format */

/**
 * Central error handler.
 * - Always returns JSON, never crashes the process.
 * - Hides internal error details (stack, driver messages) from clients in
 *   production; full stack is logged server-side instead.
 */
const errorHandler = (err, _req, res, _next) => {
	const isProduction = process.env.NODE_ENV === "production";
	// Respect an explicit status (e.g. 401 from auth, 429 from rate limit);
	// malformed statuses fall back to 500.
	const status =
		typeof err?.status === "number" && err.status >= 400 && err.status <= 599
			? err.status
			: 500;

	if (status >= 500) {
		console.error(`[${new Date().toISOString()}] Unhandled error:`, err.stack || err);
	} else {
		// 4xx errors are client problems; a one-line log is enough.
		console.warn(`[${new Date().toISOString()}] ${status}: ${err.message}`);
	}

	const message =
		status >= 500 && isProduction ? "Internal Server Error" : err.message || "Internal Server Error";

	res.status(status).json({ error: message });
};

module.exports = errorHandler;
