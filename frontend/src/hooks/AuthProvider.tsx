/** @format */

import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/config/supabase";

import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session: currentSession }, error }) => {
				if (error) {
					// A failed session restore must not leave the app stuck on the
					// loading screen; treat it as logged out.
					console.error("Gagal memuat sesi:", error.message);
				}
				setSession(currentSession ?? null);
			})
			.catch((restoreError) => {
				console.error("Gagal memuat sesi:", restoreError);
				setSession(null);
			})
			.finally(() => {
				setLoading(false);
			});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, currentSession) => {
			setSession(currentSession);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signOut = async () => {
		try {
			await supabase.auth.signOut();
		} finally {
			// Navigate even if the sign-out call fails so the user is not stuck
			// in a protected area with a broken session.
			navigate("/login");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				user: session?.user ?? null,
				loading,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
