/** @format */

import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { session, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f5f8ff]">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3a8fd6] border-t-transparent" />
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
