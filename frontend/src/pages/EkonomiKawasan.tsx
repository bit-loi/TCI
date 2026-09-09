/** @format */

import React, { useState } from "react";

import L from "leaflet";
import { Search } from "lucide-react";
import {
	MapContainer,
	Marker,
	Popup,
	Rectangle,
	TileLayer,
} from "react-leaflet";

import Layout from "@/components/ui/Layout";

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function EkonomiKawasan() {
	const [activeInsight, setActiveInsight] = useState(false);
	const center = [-6.321, 106.643]; // Cisauk Area

	// Dummy Hotspot Grid Data
	const hotspots = [
		{
			bounds: [
				[-6.32, 106.64],
				[-6.322, 106.642],
			],
			weight: 0.8,
		},
		{
			bounds: [
				[-6.318, 106.642],
				[-6.32, 106.644],
			],
			weight: 0.5,
		},
		{
			bounds: [
				[-6.322, 106.642],
				[-6.324, 106.644],
			],
			weight: 0.9,
		},
		// Tambahkan grid lainnya sesuai hasil analisis Kernel Density Estimation
	];

	return (
		<Layout>
			<MapContainer
				center={center}
				zoom={15}
				className="w-full h-full"
				zoomControl={false}
			>
				{/* Grey Base Map */}
				<TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

				{/* Hotspot Layer */}
				{hotspots.map((spot, idx) => (
					<Rectangle
						key={idx}
						bounds={spot.bounds}
						pathOptions={{
							color: "#1f5f72",
							weight: 1,
							fillOpacity: spot.weight,
							fillColor: "#1f5f72",
						}}
					/>
				))}

				{/* POI Marker (Pisang Goreng 99) */}
				<Marker position={center}>
					<Popup className="custom-popup" minWidth={300}>
						<div className="p-1">
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-bold text-lg m-0">Pisang Goreng 99</h3>
								<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-blue-200">
									#50
								</span>
							</div>
							<p className="text-xs text-gray-500 mb-3">
								Jl. Raya Cisauk Lapan, Sampora, Kec. Cisauk, Kabupaten
								Tangerang, Banten
							</p>
							<div className="bg-gray-200 w-full h-24 rounded-lg mb-3"></div>

							<div className="flex justify-between items-center mb-1">
								<div>
									<p className="text-gray-500 text-xs flex items-center gap-1">
										<span className="text-blue-500">👥</span> Konsumen Harian
									</p>
									<p className="font-bold text-blue-600 text-xl">85</p>
								</div>
								<div>
									<p className="text-gray-500 text-xs flex items-center gap-1">
										<span className="text-blue-500">📈</span> Growth Rate
									</p>
									<p className="font-bold text-blue-600 text-xl">2%</p>
								</div>
							</div>
							<button
								onClick={(e) => {
									e.preventDefault();
									setActiveInsight(true);
								}}
								className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
							>
								Cek Detail
							</button>
						</div>
					</Popup>
				</Marker>
			</MapContainer>

			{/* Floating Sidebar (Left) */}
			<div className="absolute top-28 left-4 z-[1000] bg-white w-80 rounded-xl shadow-lg p-5">
				<div className="relative mb-6">
					<Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Cari Stasiun"
						className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-full outline-none focus:border-blue-500 text-blue-500 placeholder-blue-400"
					/>
				</div>

				<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
					Jenis toko
				</h4>
				<div className="flex flex-wrap gap-2 mb-6">
					<button className="px-3 py-1.5 border border-blue-500 text-blue-500 rounded-lg text-sm bg-blue-50">
						Makanan
					</button>
					<button className="px-3 py-1.5 border border-transparent bg-gray-100 text-blue-400 hover:bg-gray-200 rounded-lg text-sm">
						Hobi
					</button>
					<button className="px-3 py-1.5 border border-transparent bg-gray-100 text-blue-400 hover:bg-gray-200 rounded-lg text-sm">
						Minuman
					</button>
					<button className="px-3 py-1.5 border border-transparent bg-gray-100 text-blue-400 hover:bg-gray-200 rounded-lg text-sm">
						Toko Buku
					</button>
					<button className="px-3 py-1.5 border border-transparent bg-gray-100 text-blue-400 hover:bg-gray-200 rounded-lg text-sm">
						lainnya
					</button>
				</div>

				<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
					Radius
				</h4>
				<div className="px-1 mb-6">
					<div className="flex justify-between text-xs text-blue-500 mb-2">
						<span>500m</span>
						<span>1km</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						defaultValue="50"
						className="w-full accent-blue-500"
					/>
				</div>

				<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
					Layers
				</h4>
				<div className="space-y-3">
					{["Hotspot", "POI", "Survey"].map((layer) => (
						<label
							key={layer}
							className="flex items-center space-x-3 cursor-pointer"
						>
							<input
								type="checkbox"
								className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
							/>
							<span className="text-sm text-blue-500">{layer}</span>
						</label>
					))}
				</div>
			</div>

			{/* Insight Panel (Right) - Appears on "Cek Detail" */}
			{activeInsight && (
				<div className="absolute top-28 right-4 z-[1000] bg-white w-96 rounded-xl shadow-lg p-6">
					<h2 className="text-2xl font-semibold text-blue-500 mb-4">
						Insight Lokasi
					</h2>
					<p className="text-sm text-blue-400 mb-6">
						Jl. Raya Cisauk Lapan, Sampora, Kec. Cisauk, Kabupaten Tangerang,
						Banten
					</p>

					<div className="flex gap-4 mb-4">
						<div className="border border-gray-200 p-3 rounded-lg flex-1">
							<p className="text-xs text-gray-400">Kategori Aktivitas</p>
							<p className="text-xl text-blue-500">Tinggi</p>
						</div>
						<div className="border border-gray-200 p-3 rounded-lg flex-1">
							<p className="text-xs text-gray-400">Aksesibilitas:</p>
							<p className="text-xl text-blue-500">Baik</p>
						</div>
					</div>

					<div className="border border-gray-200 p-4 rounded-lg mb-4">
						<p className="text-xs text-gray-400 mb-1">Usaha Sekitar:</p>
						<p className="text-xl text-blue-500">
							5 Makanan, 3 Minuman, 1 Buku
						</p>
					</div>
					<p className="text-xs text-blue-300 mb-6 flex justify-between">
						<span>Pisang Goreng 99, Nama Usaha Lain...</span>
						<span>lainnya</span>
					</p>

					<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg relative">
						<div className="absolute top-3 right-3 text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
							?
						</div>
						<p className="text-xs text-gray-400 mb-1">Insight AI</p>
						<p className="text-sm text-blue-600 leading-relaxed">
							Kawasan ini teridentifikasi memiliki keramaian yang memuncak pada
							jam pulang komuter (17:00 - 19:30). Cocok untuk usaha Fast-Food
							atau Grab & Go dengan probabilitas konversi pejalan kaki sekitar
							12%.
						</p>
					</div>

					<div className="mt-6 flex justify-end">
						<button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition">
							Tandai
						</button>
					</div>
				</div>
			)}
		</Layout>
	);
}
