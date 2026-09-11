/** @format */

/**
 * Simple in-memory rate limiter (fixed window) without extra dependencies.
 * For a single-process deployment this protects auth endpoints from brute force
 * and general endpoints from abuse. Swap for a Redis-backed store when scaling out.
 */
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX = 100; // requests per window per IP

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || DEFAULT_MAX;

const hits = new Map();

const cleanupExpired = (now) => {
	for (const [key, entry] of hits) {
		if (entry.resetAt <= now) {
			hits.delete(key);
		}
	}
};

const getClientIp = (req) => {
	// Behind a trusted proxy (nginx in production), X-Forwarded-For holds the client IP.
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string" && forwarded.length > 0) {
		return forwarded.split(",")[0].trim();
	}
	return req.ip || req.socket?.remoteAddress || "unknown";
};

const rateLimit = (options = {}) => {
	const windowMs = options.windowMs || RATE_LIMIT_WINDOW_MS;
	const max = options.max || RATE_LIMIT_MAX;
	const message = options.message || { error: "Too many requests, please try again later" };

	return (req, res, next) => {
		const now = Date.now();
		const key = `${getClientIp(req)}:${req.path}`;

		// Periodically prune expired entries so the Map does not grow unbounded.
		if (hits.size > 5000 || now % 60_000 < 50) {
			cleanupExpired(now);
		}

		const entry = hits.get(key);

		if (!entry || entry.resetAt <= now) {
			hits.set(key, {
				count: 1,
				resetAt: now + windowMs,
			});
			return next();
		}

		entry.count += 1;

		// Standard rate limit response headers.
		res.setHeader("RateLimit-Limit", max);
		res.setHeader("RateLimit-Remaining", Math.max(0, max - entry.count));
		res.setHeader("RateLimit-Reset", Math.ceil((entry.resetAt - now) / 1000));

		if (entry.count > max) {
			res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
			return res.status(429).json(message);
		}

		return next();
	};
};

/**
 * Clears all counters. Useful between tests; not needed in normal operation.
 */
const resetRateLimit = () => {
	hits.clear();
};

module.exports = { rateLimit, cleanupExpired, getClientIp, resetRateLimit };
