/** @format */

import { useMemo, useState } from "react";

import L from "leaflet";
import { Layers, Search, TrendingUp } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";

import Layout from "@/components/ui/Layout";
import { KRL_STATIONS } from "@/data/krl_stations";

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

type Station = {
	id: string;
	name: string;
	coord: [number, number];
	lines: string[];
};

function MapFocus({ station }: { station: Station | null }) {
	const map = useMap();

	if (station) {
		map.flyTo(station.coord, 15, {
			duration: 0.8,
		});
	}

	return null;
}

export default function PropertiTOD() {
	const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;
	const navigate = useNavigate();

	const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`;

	const [search, setSearch] = useState("");
	const [selectedStation, setSelectedStation] = useState<Station | null>(null);

	const [minScore, setMinScore] = useState(0);

	const [showProperty, setShowProperty] = useState(true);
	const [showTypology, setShowTypology] = useState(true);
	const [showSurvey, setShowSurvey] = useState(false);

	const [selectedTypologies, setSelectedTypologies] = useState<string[]>([]);

	const typologies = ["High Growth", "Residential", "Underused"];

	const filteredStations = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		return KRL_STATIONS.filter((station) => {
			const searchMatch =
				!keyword ||
				station.name.toLowerCase().includes(keyword) ||
				station.lines.some((line) => line.toLowerCase().includes(keyword));

			return searchMatch;
		});
	}, [search]);

	const toggleTypology = (type: string) => {
		setSelectedTypologies((current) =>
			current.includes(type)
				? current.filter((item) => item !== type)
				: [...current, type],
		);
	};

	const handleStationSelect = (station: Station) => {
		setSelectedStation(station);
	};

	return (
		<Layout>
			<div className="relative w-full h-full">
				<MapContainer
					center={[-6.316, 106.654]}
					zoom={12}
					className="w-full h-full"
					zoomControl={false}
				>
					<TileLayer
						url={cartoUrl}
						attribution="&copy; OpenStreetMap contributors &copy; CARTO"
					/>

					<MapFocus station={selectedStation} />

					{showProperty &&
						filteredStations.map((station) => (
							<Marker
								key={station.id}
								position={station.coord}
								eventHandlers={{
									click: () => handleStationSelect(station),
								}}
							>
								<Popup minWidth={280}>
									<div className="p-1">
										<div className="flex justify-between items-start mb-3">
											<div>
												<h3 className="font-bold text-lg m-0">
													{station.name}
												</h3>

												<p className="text-xs text-gray-500 mt-1">
													{station.lines.join(" • ")}
												</p>
											</div>
										</div>

										<div className="bg-gray-50 p-3 rounded-lg mb-4">
											<p className="text-xs text-gray-400">KRL Station</p>

											<p className="font-medium text-blue-600">
												{station.name}
											</p>
										</div>

										<p className="text-xs text-gray-500 mb-4">
											Pilih stasiun untuk melihat analisis Property / TOD.
										</p>

										<button
											type="button"
											onClick={() => navigate(`/map/tod/stasiun/${station.id}`)}
											className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm transition"
										>
											Cek Detail
										</button>
									</div>
								</Popup>
							</Marker>
						))}

					{showSurvey && (
						<Marker position={[-6.3195, 106.644]}>
							<Popup>
								<div className="p-1">
									<h3 className="font-bold">Survey Lapangan</h3>

									<p className="text-xs text-gray-500 mt-1">
										Objek hasil observasi lapangan MAPID.
									</p>
								</div>
							</Popup>
						</Marker>
					)}
				</MapContainer>

				<div className="absolute top-28 left-4 z-[1000] bg-white w-80 rounded-xl shadow-lg p-5">
					<div className="relative mb-6">
						<Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Cari Stasiun"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-full outline-none focus:border-blue-500 text-blue-500 placeholder-blue-400"
						/>
					</div>

					<div className="max-h-48 overflow-y-auto mb-6 space-y-1">
						{filteredStations.map((station) => {
							const active = selectedStation?.id === station.id;

							return (
								<button
									key={station.id}
									type="button"
									onClick={() => handleStationSelect(station)}
									className={`w-full text-left px-3 py-2 rounded-lg transition ${
										active
											? "bg-blue-50 text-blue-600"
											: "hover:bg-gray-50 text-gray-700"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span className="text-sm font-medium">{station.name}</span>

										<span className="text-[10px] text-gray-400">
											{station.lines[0]}
										</span>
									</div>

									<p className="text-[10px] text-gray-400 mt-0.5">
										{station.lines.join(" • ")}
									</p>
								</button>
							);
						})}

						{filteredStations.length === 0 && (
							<div className="text-xs text-gray-400 px-3 py-3">
								Stasiun tidak ditemukan.
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 mb-3">
						<TrendingUp className="w-4 h-4 text-blue-500" />

						<h4 className="text-xs text-gray-400 uppercase tracking-wider">
							Investment Score
						</h4>
					</div>

					<div className="px-1 mb-6">
						<div className="flex justify-between text-xs text-blue-500 mb-2">
							<span>0</span>

							<span>{minScore}+</span>

							<span>100</span>
						</div>

						<input
							type="range"
							min="0"
							max="100"
							value={minScore}
							onChange={(e) => setMinScore(Number(e.target.value))}
							className="w-full accent-blue-500"
						/>
					</div>

					<h4 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
						Station Typology
					</h4>

					<div className="space-y-3 mb-6">
						{typologies.map((type) => (
							<label
								key={type}
								className="flex items-center space-x-3 cursor-pointer"
							>
								<input
									type="checkbox"
									checked={selectedTypologies.includes(type)}
									onChange={() => toggleTypology(type)}
									className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
								/>

								<span className="text-sm text-blue-500">{type}</span>
							</label>
						))}
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
								checked={showProperty}
								onChange={(e) => setShowProperty(e.target.checked)}
								className="w-4 h-4 rounded border-gray-300 text-blue-500"
							/>

							<span className="text-sm text-blue-500">Property / TOD</span>
						</label>

						<label className="flex items-center space-x-3 cursor-pointer">
							<input
								type="checkbox"
								checked={showTypology}
								onChange={(e) => setShowTypology(e.target.checked)}
								className="w-4 h-4 rounded border-gray-300 text-blue-500"
							/>

							<span className="text-sm text-blue-500">Tipologi Stasiun</span>
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
					</div>
				</div>

				{selectedStation && (
					<div className="absolute top-28 right-4 z-[1000] bg-white w-80 rounded-xl shadow-lg p-5">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-[10px] uppercase tracking-wider text-gray-400">
									Selected Station
								</p>

								<h3 className="text-lg font-semibold text-gray-800 mt-1">
									{selectedStation.name}
								</h3>

								<p className="text-xs text-gray-500 mt-1">
									{selectedStation.lines.join(" • ")}
								</p>
							</div>

							<div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
								<TrendingUp className="w-4 h-4 text-blue-500" />
							</div>
						</div>

						<div className="border-t border-gray-100 my-4" />

						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-[10px] uppercase tracking-wider text-gray-400">
								KRL Lines
							</p>

							<p className="text-sm font-medium text-blue-600 mt-1">
								{selectedStation.lines.join(" • ")}
							</p>
						</div>

						<div className="mt-3 bg-blue-50 rounded-lg p-3">
							<p className="text-[10px] uppercase tracking-wider text-blue-400">
								Property / TOD
							</p>

							<p className="text-xs text-blue-600 mt-1 leading-relaxed">
								Station data loaded from the local KRL station dataset.
								Investment scoring can be applied from the analysis dataset.
							</p>
						</div>

						<button
							type="button"
							onClick={() => navigate(`/map/tod/stasiun/${selectedStation.id}`)}
							className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg text-sm transition"
						>
							Cek Detail Stasiun
						</button>
					</div>
				)}
			</div>
		</Layout>
	);
}
