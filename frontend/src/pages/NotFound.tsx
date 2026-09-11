/** @format */

import { Link } from "react-router-dom";

import Navbar from "@/components/ui/Navbar";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
				<p className="text-7xl font-bold color-gradient sm:text-8xl">404</p>
				<h1 className="mt-4 text-2xl font-semibold text-black sm:text-3xl">
					Halaman tidak ditemukan
				</h1>
				<p className="mt-3 max-w-md text-sm leading-relaxed text-[#868686] sm:text-base">
					Halaman yang Anda cari mungkin telah dipindahkan atau tautannya
					salah. Silakan kembali ke beranda atau jelajahi peta TCI.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link
						to="/"
						className="bg-gradient button-animation rounded-xl px-6 py-3 text-sm font-semibold text-white"
					>
						Kembali ke Beranda
					</Link>
					<Link
						to="/map"
						className="rounded-xl border border-[#2f7ed6] px-6 py-3 text-sm font-semibold text-[#2f7ed6] transition-colors hover:bg-[#2f7ed6] hover:text-white"
					>
						Jelajahi Peta
					</Link>
				</div>
			</main>
		</div>
	);
}
