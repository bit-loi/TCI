/** @format */

import { useState } from "react";

import { X } from "lucide-react";

export default function StationDetailPanel({ station, onClose }: any) {
	const [activeTab, setActiveTab] = useState("Summary");
	const tabs = ["Summary", "Full Trends", "Comparison"];

	return (
		<div className="fixed inset-0 z-[2000] bg-white overflow-y-auto">
			<div className="max-w-6xl mx-auto p-6 pt-24 relative">
				{/* Tombol Tutup */}
				<button
					onClick={onClose}
					className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
				>
					<X className="w-6 h-6 text-gray-600" />
				</button>

				{/* Gallery Image Placeholder */}
				<div className="grid grid-cols-3 grid-rows-2 gap-4 h-80 mb-8">
					<div className="col-span-2 row-span-2 bg-gray-200 rounded-xl"></div>
					<div className="bg-gray-200 rounded-xl"></div>
					<div className="bg-gray-400 rounded-xl flex items-center justify-center text-white text-4xl font-light">
						+3
					</div>
				</div>

				{/* Header Info */}
				<div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							{station.name}
						</h1>
						<p className="text-gray-500">{station.address}</p>
					</div>
					<span className="text-blue-500 border border-blue-400 px-4 py-1.5 rounded-full font-medium">
						Rank #{station.rank}
					</span>
				</div>

				{/* Tabs */}
				<div className="flex space-x-8 mb-8 text-2xl font-light">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`${activeTab === tab ? "text-blue-500 border-b-2 border-blue-500 font-medium pb-2" : "text-gray-300 hover:text-gray-400 pb-2"}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Konten Tab */}
				<div className="grid grid-cols-2 gap-6">
					{/* TAB 1: SUMMARY */}
					{activeTab === "Summary" && (
						<>
							<div className="space-y-6">
								<div className="flex gap-4">
									<div className="border border-blue-100 p-6 rounded-xl flex-1">
										<p className="text-blue-300 text-sm mb-2">Typology</p>
										<p className="text-2xl text-blue-500">{station.typology}</p>
									</div>
									<div className="border border-blue-100 p-6 rounded-xl w-1/3">
										<p className="text-blue-300 text-sm mb-2">Growth Rate</p>
										<p className="text-2xl text-blue-500">
											📈 {station.growth}
										</p>
									</div>
								</div>

								<div className="bg-blue-50 border border-blue-200 p-6 rounded-xl relative">
									<div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
										?
									</div>
									<p className="text-blue-300 text-sm mb-2">Insight AI</p>
									<p className="text-blue-600 leading-relaxed">
										Stasiun Cisauk mencatat peningkatan aktivitas transit
										sebesar 12% dalam kuartal terakhir. Potensi investasi
										properti untuk model sewa kost atau retail harian menempati
										skor tinggi karena konektivitas langsung (skybridge) ke
										kawasan residensial baru.
									</p>
								</div>
							</div>

							<div className="space-y-6">
								<div className="border border-blue-100 p-6 rounded-xl">
									<p className="text-blue-300 text-sm mb-2">Skor Stasiun:</p>
									<p className="text-4xl text-blue-500 font-medium mb-6">
										{station.score}
									</p>

									<p className="text-blue-400 text-sm mb-4">Breakdown Skor:</p>
									<div className="space-y-3">
										<div className="flex justify-between text-blue-500 border-b border-gray-100 pb-2">
											<span>Aktivitas Penumpang</span>
											<span>88</span>
										</div>
										<div className="flex justify-between text-blue-500 border-b border-gray-100 pb-2">
											<span>Kegiatan Ekonomi</span>
											<span>78</span>
										</div>
										<div className="flex justify-between text-blue-500 border-b border-gray-100 pb-2">
											<span>Aksesibilitas</span>
											<span>90</span>
										</div>
										<div className="flex justify-between text-blue-500 pb-2">
											<span>Ketersediaan Properti</span>
											<span>75</span>
										</div>
									</div>
								</div>
							</div>
						</>
					)}

					{/* TAB 2: COMPARISON */}
					{activeTab === "Comparison" && (
						<>
							<div className="border border-blue-200 rounded-xl p-6">
								<div className="flex items-center text-blue-400 text-sm mb-6">
									Bandingkan dengan{" "}
									<select className="ml-2 border-b border-blue-200 bg-transparent font-medium text-blue-600 outline-none">
										<option>Skor Stasiun Serpong</option>
									</select>
								</div>

								<div className="space-y-4">
									{[
										["Aktivitas Penumpang", "88", "60"],
										["Kegiatan Ekonomi", "78", "53"],
										["Aksesibilitas", "90", "80"],
										["Tren Aktivitas", "+2%", "+5%"],
										["Ketersediaan Properti", "75", "67"],
										["Rank Stasiun", "10", "40"],
									].map((row, idx) => (
										<div
											key={idx}
											className="flex justify-between text-blue-500 border-b border-gray-100 pb-3"
										>
											<span className="w-1/2">{row[0]}</span>
											<span className="w-1/4 text-center">{row[1]}</span>
											<span className="w-1/4 text-center">{row[2]}</span>
										</div>
									))}
								</div>
							</div>
							<div className="bg-blue-50 border border-blue-200 p-6 rounded-xl relative">
								<div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
									?
								</div>
								<p className="text-blue-300 text-sm mb-4">AI Summary</p>
								<p className="text-blue-600 leading-relaxed mb-4">
									Stasiun Cisauk memiliki infrastruktur transit dan aktivitas
									penumpang yang jauh lebih matang dibandingkan Stasiun Serpong,
									dibuktikan dengan skor Aksesibilitas (90 berbanding 80).
								</p>
								<p className="text-blue-600 leading-relaxed">
									Namun, Stasiun Serpong mencatatkan Tren Aktivitas yang lebih
									agresif (+5%), menjadikannya kandidat kuat untuk investasi
									lahan jangka menengah sebelum titik jenuh komersial tercapai.
								</p>
							</div>
						</>
					)}

					{/* TAB 3: FULL TRENDS */}
					{activeTab === "Full Trends" && (
						<>
							<div className="border border-blue-100 rounded-xl p-6 h-96 flex flex-col">
								<p className="text-blue-300 mb-4">Activity Trend</p>
								<div className="bg-gray-200 flex-1 rounded flex items-center justify-center text-gray-500">
									graph (historical)
								</div>
							</div>
							<div className="border border-blue-100 rounded-xl p-6 h-96 flex flex-col">
								<p className="text-blue-300 mb-4">Forecasted Trend</p>
								<div className="flex-1 rounded border border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center relative">
									{/* Simulasi Grafik Prediksi */}
									<span className="absolute top-2 left-2 text-xs text-blue-400">
										Prediksi Kepadatan Masyarakat
									</span>
									<span className="text-blue-400">
										Time-Series Forecast Graph
									</span>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
