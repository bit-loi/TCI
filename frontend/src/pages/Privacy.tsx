/** @format */

import { Link } from "react-router-dom";

import Navbar from "@/components/ui/Navbar";

export default function Privacy() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<div className="mx-auto max-w-3xl px-6 py-24">
				<h1 className="mb-6 text-3xl font-bold text-black">Kebijakan Privasi</h1>
				<p className="mb-4 text-sm text-[#868686]">Terakhir diperbarui: 11 September 2026</p>

				<div className="space-y-6 text-[#555555] leading-relaxed">
					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">1. Informasi yang Kami Kumpulkan</h2>
						<p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama dan alamat email. Kami juga mengumpulkan data penggunaan platform seperti halaman yang dikunjungi dan fitur yang digunakan.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">2. Penggunaan Informasi</h2>
						<p>Informasi yang kami kumpulkan digunakan untuk: menyediakan dan memelihara layanan, mengirimkan pemberitahuan terkait akun, meningkatkan kualitas platform, dan melakukan analitik penggunaan untuk pengembangan fitur.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">3. Berbagi Data</h2>
						<p>Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Data hanya dapat dibagikan dengan pihak ketiga yang membantu operasional platform, seperti penyedia infrastruktur cloud, di bawah perjanjian kerahasiaan.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">4. Keamanan Data</h2>
						<p>Kami menggunakan enkripsi dan langkah-langkah keamanan teknis yang sesuai standar industri untuk melindungi data Anda. Autentikasi dikelola melalui Supabase dengan enkripsi end-to-end.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">5. Hak Pengguna</h2>
						<p>Anda memiliki hak untuk: mengakses data pribadi Anda, memperbarui informasi yang tidak akurat, menghapus akun Anda, dan menolak pemrosesan data tertentu. Hubungi kami untuk menggunakan hak-hak ini.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">6. Cookie</h2>
						<p>TCI menggunakan cookie yang diperlukan untuk autentikasi dan sesi pengguna. Kami tidak menggunakan cookie pelacak untuk tujuan periklanan.</p>
					</section>

					<section>
						<h2 className="mb-2 text-lg font-semibold text-black">7. Kontak</h2>
						<p>Untuk pertanyaan terkait privasi, hubungi kami melalui email yang tercantum di halaman kontak kami.</p>
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
