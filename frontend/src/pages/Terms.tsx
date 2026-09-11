/** @format */

import { Link } from "react-router-dom";

import Navbar from "@/components/ui/Navbar";

export default function Terms() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<div className="mx-auto max-w-3xl px-6 py-24">
				<h1 className="mb-6 text-3xl font-bold text-black">Syarat & Ketentuan</h1>
				<p className="mb-4 text-sm text-[#868686]">Terakhir diperbarui: 11 September 2026</p>

				<div className="space-y-6 text-[#555555] leading-relaxed">
					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">1. Penerimaan Syarat</h2>
						<p>Dengan mengakses dan menggunakan Transit Commerce Intelligence (TCI), Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan ini.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">2. Penggunaan Layanan</h2>
						<p>TCI menyediakan platform analitik untuk data transit dan ekonomi kawasan. Anda diperbolehkan menggunakan layanan ini untuk tujuan penelitian, analisis, dan pengambilan keputusan terkait pengembangan transit-oriented development.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">3. Akun Pengguna</h2>
						<p>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda dan semua aktivitas yang terjadi di bawah akun Anda. Segera beritahu kami jika Anda mendeteksi penggunaan tidak sah.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">4. Hak Kekayaan Intelektual</h2>
						<p>Seluruh konten, fitur, dan data pada platform TCI dilindungi oleh hukum hak cipta dan kekayaan intelektual. Anda tidak diperkenankan menyalin, mendistribusikan, atau menggunakan konten tanpa izin tertulis.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">5. Batasan Tanggung Jawab</h2>
						<p>TCI menyediakan data dan analitik "sebagaimana adanya". Kami tidak menjamin akurasi data pihak ketiga. Keputusan investasi atau pengembangan berdasarkan data TCI sepenuhnya menjadi tanggung jawab pengguna.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">6. Perubahan Ketentuan</h2>
						<p>Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui platform atau email.</p>
					</section>
				</div>

				<div className="mt-10">
					<Link to="/register" className="text-sm font-semibold text-[#3a8fd6] hover:text-[#2f7ed6]">
						← Kembali ke Pendaftaran
					</Link>
				</div>
			</div>
		</div>
	);
}
