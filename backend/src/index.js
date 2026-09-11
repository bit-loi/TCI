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

// General API rate limit.
app.use("/api", rateLimit());
// Tighter limit on authentication endpoints against brute force.
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

app.use(logger);

app.get("/api/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
	res.json({ user: req.user });
});

// 404 handler for unknown API routes (must come after real routes).
app.use((_req, res) => {
	res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

module.exports = app;
