/** @format */

import { useState } from "react";

import L from "leaflet";
import { Layers, MapPin, Ruler, Search } from "lucide-react";
import {
	Circle,
	MapContainer,
	Marker,
	Popup,
	Rectangle,
	TileLayer,
} from "react-leaflet";

import Layout from "@/components/ui/Layout";

// @ts-ignore
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
	const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;

	const center: [number, number] = [-6.321, 106.643];

	const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`;

	const [activeInsight, setActiveInsight] = useState(false);

	const [selectedCategory, setSelectedCategory] = useState("Makanan");

	const [radius, setRadius] = useState(750);

	const [showHotspot, setShowHotspot] = useState(true);
	const [showSurvey, setShowSurvey] = useState(false);
	const [showBuffer, setShowBuffer] = useState(false);

	const hotspots = [
		{
			id: 1,
			bounds: [
				[-6.32, 106.64],
				[-6.322, 106.642],
			] as [[number, number], [number, number]],
			weight: 0.8,
		},
		{
			id: 2,
			bounds: [
				[-6.318, 106.642],
				[-6.32, 106.644],
			] as [[number, number], [number, number]],
			weight: 0.5,
		},
		{
			id: 3,
			bounds: [
				[-6.322, 106.642],
				[-6.324, 106.644],
			] as [[number, number], [number, number]],
			weight: 0.9,
		},
	];

	const surveyPoints = [
		{
			id: 1,
			name: "Pisang Goreng 99",
			category: "F&B",
			position: [-6.321, 106.643] as [number, number],
			activity: "Tinggi",
		},
		{
			id: 2,
			name: "Warung Cisauk",
			category: "F&B",
			position: [-6.3195, 106.644] as [number, number],
			activity: "Sedang",
		},
	];

	return (
		<Layout>
			<MapContainer
				center={center}
				zoom={15}
				className="w-full h-full"
				zoomControl={false}
			>
				<TileLayer
					url={cartoUrl}
					attribution="&copy; OpenStreetMap contributors &copy; CARTO"
				/>

				{showHotspot &&
					hotspots.map((spot) => (
						<Rectangle
							key={spot.id}
							bounds={spot.bounds}
							pathOptions={{
								color: "#1f5f72",
								weight: 1,
								fillOpacity: spot.weight * 0.7,
								fillColor: "#1f5f72",
							}}
						/>
					))}

				{showSurvey &&
					surveyPoints.map((point) => (
						<Marker key={point.id} position={point.position}>
							<Popup minWidth={260}>
								<div className="p-1">
									<h3 className="font-bold text-lg mb-1">{point.name}</h3>

									<p className="text-xs text-gray-500 mb-3">Survey Lapangan</p>

									<div className="grid grid-cols-2 gap-2">
										<div className="bg-gray-50 p-2 rounded">
											<p className="text-xs text-gray-400">Kategori</p>

											<p className="font-medium text-blue-600">
												{point.category}
											</p>
										</div>

										<div className="bg-gray-50 p-2 rounded">
											<p className="text-xs text-gray-400">Aktivitas</p>

											<p className="font-medium text-blue-600">
												{point.activity}
											</p>
										</div>
									</div>
								</div>
							</Popup>
						</Marker>
					))}

				{showBuffer && (
					<Circle
						center={center}
						radius={radius}
						pathOptions={{
							color: "#1f5f72",
							fillOpacity: 0.08,
							weight: 2,
						}}
					/>
				)}

				<Marker position={center}>
					<Popup minWidth={300}>
						<div className="p-1">
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-bold text-lg m-0">Pisang Goreng 99</h3>

								<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
									Hotspot
								</span>
							</div>

							<p className="text-xs text-gray-500 mb-3">
								Jl. Raya Cisauk Lapan, Sampora, Kec. Cisauk, Kabupaten Tangerang
							</p>

							<div className="flex justify-between mb-4">
								<div>
									<p className="text-xs text-gray-500">Konsumen Harian</p>

									<p className="font-bold text-blue-600 text-xl">85</p>
								</div>

								<div>
									<p className="text-xs text-gray-500">Growth Rate</p>

									<p className="font-bold text-blue-600 text-xl">+2%</p>
								</div>
							</div>

							<button
								onClick={() => setActiveInsight(true)}
								className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
							>
								Cek Detail
							</button>
						</div>
					</Popup>
				</Marker>
			</MapContainer>

			<div className="absolute top-28 left-4 z-[1000] bg-white w-80 rounded-xl shadow-lg p-5">
				<div className="relative mb-6">
					<Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

					<input
						type="text"
						placeholder="Cari Stasiun"
						className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-full outline-none focus:border-blue-500 text-blue-500 placeholder-blue-400"
					/>
				</div>

				<div className="flex items-center gap-2 mb-3">
					<MapPin className="w-4 h-4 text-blue-500" />

					<h4 className="text-xs text-gray-400 uppercase tracking-wider">
						Hotspot Finder
					</h4>
				</div>

				<div className="flex flex-wrap gap-2 mb-6">
					{["Makanan", "Minuman", "Hobi", "Toko Buku", "Lainnya"].map(
						(category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-3 py-1.5 rounded-lg text-sm border transition ${
									selectedCategory === category
										? "border-blue-500 bg-blue-50 text-blue-500"
										: "border-transparent bg-gray-100 text-blue-400 hover:bg-gray-200"
								}`}
							>
								{category}
							</button>
						),
					)}
				</div>

				<div className="flex items-center gap-2 mb-3">
					<Ruler className="w-4 h-4 text-blue-500" />

					<h4 className="text-xs text-gray-400 uppercase tracking-wider">
						Radius / Buffer
					</h4>
				</div>

				<div className="px-1 mb-6">
					<div className="flex justify-between text-xs text-blue-500 mb-2">
						<span>500m</span>
						<span>{radius}m</span>
						<span>1km</span>
					</div>

					<input
						type="range"
						min="500"
						max="1000"
						step="50"
						value={radius}
						onChange={(e) => {
							setRadius(Number(e.target.value));
							setShowBuffer(true);
						}}
						className="w-full accent-blue-500"
					/>
				</div>

				<div className="flex items-center gap-2 mb-3">
					<Layers className="w-4 h-4 text-blue-500" />

					<h4 className="text-xs text-gray-400 uppercase tracking-wider">
						Layers
					</h4>
				</div>

				<div className="space-y-3">
					<label className="flex items-center space-x-3 cursor-pointer">
						<input
							type="checkbox"
							checked={showHotspot}
							onChange={(e) => setShowHotspot(e.target.checked)}
							className="w-4 h-4 rounded border-gray-300 text-blue-500"
						/>

						<span className="text-sm text-blue-500">Heatmap Hotspot</span>
					</label>

					<label className="flex items-center space-x-3 cursor-pointer">
						<input
							type="checkbox"
							checked={showSurvey}
							onChange={(e) => setShowSurvey(e.target.checked)}
							className="w-4 h-4 rounded border-gray-300 text-blue-500"
						/>

						<span className="text-sm text-blue-500">Survei Lapangan</span>
					</label>

					<label className="flex items-center space-x-3 cursor-pointer">
						<input
							type="checkbox"
							checked={showBuffer}
							onChange={(e) => setShowBuffer(e.target.checked)}
							className="w-4 h-4 rounded border-gray-300 text-blue-500"
						/>

						<span className="text-sm text-blue-500">Radius / Buffer</span>
					</label>
				</div>
			</div>

			{activeInsight && (
				<div className="absolute top-28 right-4 z-[1000] bg-white w-96 rounded-xl shadow-lg p-6">
					<div className="flex justify-between items-start mb-4">
						<h2 className="text-2xl font-semibold text-blue-500">
							Insight Lokasi
						</h2>

						<button
							onClick={() => setActiveInsight(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							×
						</button>
					</div>

					<p className="text-sm text-blue-400 mb-6">
						Jl. Raya Cisauk Lapan, Sampora, Kabupaten Tangerang
					</p>

					<div className="flex gap-4 mb-4">
						<div className="border border-gray-200 p-3 rounded-lg flex-1">
							<p className="text-xs text-gray-400">Aktivitas</p>

							<p className="text-xl text-blue-500">Tinggi</p>
						</div>

						<div className="border border-gray-200 p-3 rounded-lg flex-1">
							<p className="text-xs text-gray-400">Aksesibilitas</p>

							<p className="text-xl text-blue-500">Baik</p>
						</div>
					</div>

					<div className="border border-gray-200 p-4 rounded-lg mb-4">
						<p className="text-xs text-gray-400 mb-1">Kategori Terpilih</p>

						<p className="text-xl text-blue-500">{selectedCategory}</p>
					</div>

					<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
						<p className="text-xs text-gray-400 mb-1">Insight AI</p>

						<p className="text-sm text-blue-600 leading-relaxed">
							Kawasan ini menunjukkan konsentrasi aktivitas ekonomi yang relatif
							tinggi di sekitar simpul transportasi. Hasil analisis dapat
							digunakan untuk membandingkan potensi lokasi berdasarkan jenis
							usaha, aksesibilitas, dan aktivitas kawasan.
						</p>
					</div>
				</div>
			)}
		</Layout>
	);
}
