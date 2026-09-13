/** @format */

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { apiFetch, clearTokens, getRefreshToken, setTokens } from "@/config/api";

import { AuthContext, type AuthUser } from "./AuthContext";

interface SessionData {
	user: AuthUser;
	access_token: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [session, setSession] = useState<SessionData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		apiFetch("/api/auth/me")
			.then(async (res) => {
				if (res.status === 429) {
					// Rate-limited — keep existing tokens, just stop loading.
					setLoading(false);
					return;
				}
				if (!res.ok) {
					clearTokens();
					setSession(null);
					return;
				}
				const data = await res.json();
				const token = localStorage.getItem("sb_access_token");
				setSession({
					user: data.user,
					access_token: token || "",
				});
			})
		.catch(() => {
			clearTokens();
			setSession(null);
		})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const completeSignIn = (
		user: AuthUser,
		accessToken: string,
		refreshToken: string,
	) => {
		setTokens(accessToken, refreshToken);
		setSession({ user, access_token: accessToken });
	};

	const signOut = async () => {
		try {
			const refreshToken = getRefreshToken();
			await apiFetch("/api/auth/signout", {
				method: "POST",
				body: JSON.stringify({ refresh_token: refreshToken }),
			});
		} finally {
			clearTokens();
			setSession(null);
			navigate("/login");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				user: session?.user ?? null,
				loading,
				completeSignIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
