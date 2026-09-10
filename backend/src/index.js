/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./middlewares/logger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/api/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
	res.json({ user: req.user });
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
