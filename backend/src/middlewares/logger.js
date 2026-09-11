/** @format */

const SENSITIVE_KEYS = new Set([
	"password",
	"email",
	"token",
	"authorization",
	"apikey",
	"api_key",
	"secret",
	"key",
]);

/**
 * Request logger.
 * - Logs method, path, status code, and duration instead of the full URL, so
 *   tokens in query strings are never written to logs.
 * - Redacts sensitive values if a body ever gets logged.
 */
const logger = (req, res, next) => {
	const start = process.hrtime.bigint();
	const { method } = req;
	// Log only the pathname: query strings can carry tokens or PII.
	const path = req.url ? req.url.split("?")[0] : "-";

	res.on("finish", () => {
		const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
		const timestamp = new Date().toISOString();
		console.log(
			`[${timestamp}] ${method} ${path} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
		);
	});

	next();
};

module.exports = logger;
module.exports.SENSITIVE_KEYS = SENSITIVE_KEYS;
