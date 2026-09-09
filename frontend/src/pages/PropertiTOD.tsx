/** @format */

import { useState } from "react";

import { Search } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import StationDetailPanel from "@/components/map/StationDetailPanel";
import Layout from "@/components/ui/Layout";

export default function PropertiTOD() {
	const [selectedStation, setSelectedStation] = useState(null);

	// Dummy Station Data (Sesuai KRL Jabodetabek)
	const stations = [
		{
			id: 1,
			name: "Stasiun Cisauk",
			rank: 10,
			score: 89,
			pos: [-6.321, 106.643],
			address:
				"Jl. Raya Cisauk Lapan, Sampora, Kec. Cisauk, Kabupaten Tangerang, Banten",
			typology: "High Growth Transit Hub",
			growth: "+2%",
		},
		{
			id: 2,
			name: "Stasiun Serpong",
			rank: 40,
			score: 70,
			pos: [-6.311, 106.666],
			address: "Jl. Raya Serpong, Kec. Serpong, Kota Tangerang Selatan, Banten",
			typology: "Residential Transit",
			growth: "+5%",
		},
	];

	return (
		<Layout>
			<MapContainer
				// @ts-ignore
				center={[-6.316, 106.654]}
				zoom={14}
				className="w-full h-full"
				zoomControl={false}
			>
				<TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

				{stations.map((st) => (
					<Marker key={st.id} position={st.pos}>
						// @ts-ignore
						<Popup minWidth={280}>
							<div className="p-1">
								<div className="flex justify-between items-start mb-2">
									<h3 className="font-bold text-lg m-0">{st.name}</h3>
									<span className="text-xs bg-white text-blue-500 border border-blue-400 px-2 py-1 rounded-full">
										#{st.rank}
									</span>
								</div>
								<p className="text-xs text-gray-500 mb-4">{st.address}</p>

								<div className="flex justify-between items-center mb-1">
									<div>
										<p className="text-gray-400 text-xs flex items-center gap-1">
											🏢 Skor Stasiun
										</p>
										<p className="font-bold text-blue-600 text-xl">
											{st.score}
										</p>
									</div>
									<button
										onClick={() => setSelectedStation(st)}
										className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition"
									>
										Cek Detail
									</button>
								</div>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>

			{/* Sidebar untuk Layer TOD */}
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
					Skor Stasiun
				</h4>
				<div className="px-1 mb-6">
					<div className="flex justify-between text-xs text-blue-500 mb-2">
						<span>0</span>
						<span>100</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						defaultValue="80"
						className="w-full accent-blue-500"
					/>
				</div>

				<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
					Typology
				</h4>
				<div className="space-y-3 mb-6">
					{["High Growth", "Residential", "Underused"].map((type) => (
						<label
							key={type}
							className="flex items-center space-x-3 cursor-pointer"
						>
							<input
								type="checkbox"
								className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
							/>
							<span className="text-sm text-blue-500">{type}</span>
						</label>
					))}
				</div>

				<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
					Layers
				</h4>
				<div className="space-y-3">
					{["Investasi", "Properti", "Aksesibilitas"].map((layer) => (
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

			{/* Overlay Modal Detail Stasiun */}
			{selectedStation && (
				<StationDetailPanel
					station={selectedStation}
					onClose={() => setSelectedStation(null)}
				/>
			)}
		</Layout>
	);
}
