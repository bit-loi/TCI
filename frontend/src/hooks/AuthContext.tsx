/** @format */

import { createContext } from "react";

export interface AuthUser {
	id: string;
	email: string;
}

export interface AuthContextType {
	session: { user: AuthUser; access_token: string } | null;
	user: AuthUser | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	session: null,
	user: null,
	loading: true,
	signOut: async () => {},
});
