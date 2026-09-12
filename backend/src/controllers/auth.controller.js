/** @format */

const { supabase } = require("../config/supabase");

const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY,
);

const signup = async (req, res) => {
	const { email, password, fullName } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email dan password wajib diisi" });
	}

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { full_name: fullName } },
	});

	if (error) {
		return res.status(400).json({ error: error.message });
	}

	const hasSession = !!data.session;
	return res.status(201).json({
		user: data.user
			? { id: data.user.id, email: data.user.email }
			: null,
		session: hasSession
			? {
					access_token: data.session.access_token,
					refresh_token: data.session.refresh_token,
					expires_in: data.session.expires_in,
					expires_at: data.session.expires_at,
				}
			: null,
		requiresVerification: !hasSession,
	});
};

const signin = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email dan password wajib diisi" });
	}

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		const message =
			error.message === "Invalid login credentials"
				? "Email atau password salah"
				: error.message;
		return res.status(401).json({ error: message });
	}

	return res.json({
		user: { id: data.user.id, email: data.user.email },
		session: {
			access_token: data.session.access_token,
			refresh_token: data.session.refresh_token,
			expires_in: data.session.expires_in,
			expires_at: data.session.expires_at,
		},
	});
};

const signout = async (req, res) => {
	const { refresh_token } = req.body;

	if (refresh_token) {
		await supabaseAdmin.auth.admin.revokeRefreshToken(refresh_token);
	}

	return res.json({ message: "Berhasil logout" });
};

const me = async (req, res) => {
	return res.json({
		user: { id: req.user.id, email: req.user.email },
	});
};

const resetPassword = async (req, res) => {
	const { email, redirectTo } = req.body;

	if (!email) {
		return res.status(400).json({ error: "Email wajib diisi" });
	}

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: redirectTo || `${req.headers.origin}/login`,
	});

	if (error) {
		return res.status(400).json({ error: error.message });
	}

	return res.json({ message: "Link reset password telah dikirim" });
};

module.exports = { signup, signin, signout, me, resetPassword };
