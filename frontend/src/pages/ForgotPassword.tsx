/** @format */

import { useState } from "react";

import { Link } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";
import AuthLayout from "@/components/ui/AuthLayout";
import { apiFetch } from "@/config/api";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await apiFetch("/api/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({
					email,
					redirectTo: `${window.location.origin}/login`,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Gagal mengirim link reset");
				return;
			}

			setSent(true);
		} catch {
			setError("Gagal terhubung ke server");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<div className="animate-fade-up relative z-10 w-full min-w-0 max-w-md [overflow-wrap:anywhere] motion-reduce:animate-none!">
				<div className="rounded-3xl bg-white px-6 py-8 shadow-[0_20px_50px_#D3DEF5] sm:p-10">
					<Link
						to="/login"
						className="mb-6 inline-flex items-center gap-2 text-sm text-[#868686] transition-colors hover:text-[#3a8fd6]"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="m15 18-6-6 6-6" />
						</svg>
						Kembali ke Login
					</Link>

					<div className="mb-8 flex flex-col items-center text-center">
						<Link to="/" aria-label="TCI, return to home">
							<img src={LogoNav} alt="Logo TCI" className="mb-4 w-20 object-cover" />
						</Link>
						<h1 className="text-2xl font-semibold text-black">Lupa Password</h1>
						<p className="mt-2 text-sm text-[#868686]">
							Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
						</p>
					</div>

					{error && (
						<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
							{error}
						</div>
					)}

					{sent ? (
						<div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
							Link reset password telah dikirim ke <strong>{email}</strong>. Silakan cek email Anda.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							<div>
								<label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#555555]">
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Masukkan email Anda"
									required
									className="w-full rounded-xl border border-[#e0e0e0] bg-[#f9fbff] px-4 py-3 text-base text-gray-700 outline-none transition-colors focus:border-[#3a8fd6] focus:ring-2 focus:ring-[#3a8fd6]/20"
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="bg-gradient button-animation mt-2 w-full cursor-pointer rounded-xl py-3.5 text-base font-semibold text-white disabled:opacity-60"
							>
								{loading ? "Mengirim..." : "Kirim Link Reset"}
							</button>
						</form>
					)}
				</div>
			</div>
		</AuthLayout>
	);
}
