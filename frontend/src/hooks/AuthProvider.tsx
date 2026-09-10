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
		supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
			setSession(currentSession);
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
		await supabase.auth.signOut();
		navigate("/login");
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
