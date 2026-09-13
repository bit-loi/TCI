/** @format */

const express = require("express");
const router = express.Router();

// Hard-coded list of allowed Overpass endpoints — never forward to an
// arbitrary URL supplied by the client (avoids SSRF).
const OVERPASS_ENDPOINTS = [
	"https://maps.mail.ru/osm/tools/overpass/api/interpreter",
	"https://overpass-api.de/api/interpreter",
];

// Largest query body we will forward (bytes). Overpass queries are normally
// small; anything larger is likely abusive or malformed.
const MAX_QUERY_BYTES = 8192;

// Forward timeout in milliseconds.
const FORWARD_TIMEOUT_MS = 9_000;

const OVERPASS_USER_AGENT = "TCI-Demo/1.0 (https://tci-nfs5.vercel.app)";

// Try each endpoint in order until one responds OK.
async function forwardQuery(query) {
	let lastError;

	for (const url of OVERPASS_ENDPOINTS) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"User-Agent": OVERPASS_USER_AGENT,
				},
				body: "data=" + encodeURIComponent(query),
				signal: controller.signal,
			});

			if (response.status === 429) {
				// Rate limited — try next endpoint.
				continue;
			}

			if (!response.ok) {
				throw new Error("Overpass HTTP " + response.status);
			}

			return response;
		} catch (error) {
			lastError = error;
		} finally {
			clearTimeout(timer);
		}
	}

	throw lastError || new Error("Overpass request failed");
}

// Parse the Overpass XML/JSON response depending on what the endpoints return.
// Overpass interpreter returns JSON when the query starts with [out:json].
async function parseResponse(response) {
	const text = await response.text();
	// Overpass returns JSON for [out:json] queries.
	try {
		return JSON.parse(text);
	} catch (e) {
		// Fallback: return raw text so the frontend can still inspect it.
		return { raw: text };
	}
}

router.post("/", async (req, res) => {
	// Validate input.
	if (!req.body || typeof req.body !== "object") {
		return res.status(400).json({ error: "Invalid request body" });
	}

	const rawData = req.body.data;
	if (typeof rawData !== "string") {
		return res.status(400).json({ error: "Missing or invalid 'data' field" });
	}

	if (Buffer.byteLength(rawData, "utf8") > MAX_QUERY_BYTES) {
		return res.status(413).json({ error: "Query too large" });
	}

	try {
		const response = await forwardQuery(rawData);
		const data = await parseResponse(response);
		res.json(data);
	} catch (error) {
		console.error("Overpass proxy error:", error);
		res.status(502).json({ error: "Overpass request failed" });
	}
});

module.exports = router;
