/** @format */

import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Vitest 3 augments Vite 7 types while this project runs Vite 8, so the
// `test` key has no type home yet. The assertion keeps tsc happy without
// changing runtime behavior; drop it when Vitest gains native Vite 8 support.
const config = {
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		proxy: {
			"/api/overpass": {
				target: "https://overpass-api.de",
				changeOrigin: true,
				rewrite: () => "/api/interpreter",
			},
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		css: false,
	},
} as UserConfig;

export default defineConfig(config);
