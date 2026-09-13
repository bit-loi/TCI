/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { corsOptions } = require("./config/cors");
const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./middlewares/logger");
const securityHeaders = require("./middlewares/security");
const { rateLimit } = require("./middlewares/rateLimit");

const app = express();
const PORT = process.env.PORT || 3000;

// Behind the production nginx proxy, trust X-Forwarded-For so req.ip is correct.
if (process.env.NODE_ENV === "production") {
	app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors(corsOptions));
// Cap request body size to blunt oversized-payload DoS.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

// General API rate limit.
app.use("/api", rateLimit());
// Tighter limit on sensitive auth endpoints against brute force.
// /api/auth/me is excluded — it is a read-only session check, not a credential endpoint.
app.use(
	"/api/auth/signin",
	rateLimit({ windowMs: 5 * 60 * 1000, max: 30 }),
);
app.use(
	"/api/auth/signup",
	rateLimit({ windowMs: 5 * 60 * 1000, max: 20 }),
);
app.use(
	"/api/auth/signout",
	rateLimit({ windowMs: 5 * 60 * 1000, max: 30 }),
);
app.use(
	"/api/auth/reset-password",
	rateLimit({ windowMs: 5 * 60 * 1000, max: 5 }),
);

app.use(logger);

app.get("/", (_req, res) => {
	res.json({
		status: "ok",
		service: "TCI API",
		health: "/api/health",
	});
});

app.get("/api/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/stations", require("./routes/station.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/overpass", require("./routes/overpass.routes"));

// 404 handler for unknown API routes (must come after real routes).
app.use((_req, res) => {
	res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

// Start a persistent HTTP server only when this file is executed directly.
// Vercel imports the exported Express app and owns the server lifecycle.
if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

module.exports = app;
