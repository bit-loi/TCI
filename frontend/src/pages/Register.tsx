/** @format */

import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";
import { supabase } from "@/config/supabase";

export default function Register() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Password tidak cocok!");
			return;
		}

		setLoading(true);

		const { data, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: name },
			},
		});

		if (authError) {
			setError(authError.message);
			setLoading(false);
			return;
		}

		if (data.user && !data.session) {
			navigate("/login?registered=true");
		} else {
			navigate("/dashboard");
		}

		setLoading(false);
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-[#f0f6ff] px-4 py-12">
			{/* Decorative background blobs */}
			<div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#60d2cd]/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#3281d8]/10 blur-3xl" />

			<div className="animate-fade-up relative z-10 w-full max-w-md">
				{/* Card */}
				<div className="rounded-3xl bg-white p-8 shadow-[0_20px_50px_#D3DEF5] sm:p-10">
					{/* Back to Home */}
					<Link
						to="/"
						className="mb-6 inline-flex items-center gap-2 text-sm text-[#868686] transition-colors hover:text-[#3a8fd6]"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m15 18-6-6 6-6" />
						</svg>
						Kembali ke Beranda
					</Link>

					{/* Logo & Title */}
					<div className="mb-8 flex flex-col items-center">
						<Link to="/" aria-label="TCI, return to home">
							<img
								src={LogoNav}
								alt="Logo TCI"
								className="mb-4 w-20 object-cover"
							/>
						</Link>
						<h1 className="text-2xl font-semibold text-black">
							Buat Akun Baru
						</h1>
						<p className="mt-2 text-sm text-[#868686]">
							Gabung dan mulai jelajahi insight transit
						</p>
					</div>

					{/* Error */}
					{error && (
						<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
							{error}
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* Name */}
						<div>
							<label
								htmlFor="name"
								className="mb-1.5 block text-sm font-medium text-[#555555]"
							>
								Nama Lengkap
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Masukkan nama lengkap Anda"
								required
								className="w-full rounded-xl border border-[#e0e0e0] bg-[#f9fbff] px-4 py-3 text-base text-gray-700 outline-none transition-colors focus:border-[#3a8fd6] focus:ring-2 focus:ring-[#3a8fd6]/20"
							/>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-[#555555]"
							>
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

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="mb-1.5 block text-sm font-medium text-[#555555]"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Buat password baru"
									required
									minLength={8}
									className="w-full rounded-xl border border-[#e0e0e0] bg-[#f9fbff] px-4 py-3 pr-12 text-base text-gray-700 outline-none transition-colors focus:border-[#3a8fd6] focus:ring-2 focus:ring-[#3a8fd6]/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868686] transition-colors hover:text-[#3a8fd6]"
									aria-label={
										showPassword ? "Sembunyikan password" : "Tampilkan password"
									}
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
											<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
											<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="mb-1.5 block text-sm font-medium text-[#555555]"
							>
								Konfirmasi Password
							</label>
							<input
								id="confirmPassword"
								type={showPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Ulangi password Anda"
								required
								minLength={8}
								className="w-full rounded-xl border border-[#e0e0e0] bg-[#f9fbff] px-4 py-3 text-base text-gray-700 outline-none transition-colors focus:border-[#3a8fd6] focus:ring-2 focus:ring-[#3a8fd6]/20"
							/>
						</div>

						{/* Terms */}
						<p className="text-xs text-[#868686]">
							Dengan mendaftar, Anda menyetujui{" "}
							<Link to="/terms" className="text-[#3a8fd6] hover:underline">
								Syarat & Ketentuan
							</Link>{" "}
							dan{" "}
							<Link to="/privacy" className="text-[#3a8fd6] hover:underline">
								Kebijakan Privasi
							</Link>{" "}
							TCI.
						</p>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="bg-gradient button-animation mt-1 w-full cursor-pointer rounded-xl py-3.5 text-base font-semibold text-white disabled:opacity-60"
						>
							{loading ? "Mendaftar..." : "Daftar"}
						</button>
					</form>

					{/* Divider */}
					<div className="my-6 flex items-center gap-4">
						<div className="h-px flex-1 bg-[#e0e0e0]" />
						<span className="text-sm text-[#868686]">atau</span>
						<div className="h-px flex-1 bg-[#e0e0e0]" />
					</div>

					{/* Login link */}
					<p className="text-center text-sm text-[#868686]">
						Sudah punya akun?{" "}
						<Link
							to="/login"
							className="font-semibold text-[#3a8fd6] transition-colors hover:text-[#2f7ed6]"
						>
							Masuk di sini
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
