/** @format */

/**
 * Minimal security headers middleware (helmet-style) without extra dependencies.
 * Applied to every response before routes run.
 */
const securityHeaders = (_req, res, next) => {
	// Prevent browsers from MIME-sniffing away from the declared Content-Type.
	res.setHeader("X-Content-Type-Options", "nosniff");
	// Disable browser features the API does not use.
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-DNS-Prefetch-Control", "off");
	// Avoid leaking that the API is powered by Express.
	res.removeHeader("X-Powered-By");
	// Refuse cross-origin referrer leakage.
	res.setHeader("Referrer-Policy", "no-referrer");
	// Isolate the response in its own browsing context (Spectre-style mitigations).
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	res.setHeader("Cross-Origin-Resource-Policy", "same-site");

	next();
};

module.exports = securityHeaders;
