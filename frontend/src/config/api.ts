/** @format */

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAccessToken(): string | null {
	return localStorage.getItem("sb_access_token");
}

export async function apiFetch(
	path: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = getAccessToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}
	return fetch(`${API}${path}`, { ...options, headers });
}

export function setTokens(accessToken: string, refreshToken: string) {
	localStorage.setItem("sb_access_token", accessToken);
	localStorage.setItem("sb_refresh_token", refreshToken);
}

export function clearTokens() {
	localStorage.removeItem("sb_access_token");
	localStorage.removeItem("sb_refresh_token");
}

export function getRefreshToken(): string | null {
	return localStorage.getItem("sb_refresh_token");
}
