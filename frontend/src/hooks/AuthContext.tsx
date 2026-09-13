/** @format */

import { createContext } from "react";

export interface AuthUser {
	id: string;
	email: string;
	user_metadata?: {
		full_name?: string;
	};
}

export interface AuthContextType {
	session: { user: AuthUser; access_token: string } | null;
	user: AuthUser | null;
	loading: boolean;
	completeSignIn: (
		user: AuthUser,
		accessToken: string,
		refreshToken: string,
	) => void;
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	session: null,
	user: null,
	loading: true,
	completeSignIn: () => {},
	signOut: async () => {},
});
