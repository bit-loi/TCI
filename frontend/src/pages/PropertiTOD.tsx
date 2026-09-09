/** @format */

import { useState } from "react";

import { Layers, Search, TrendingUp } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";

import Layout from "@/components/ui/Layout";

type Station = {
	id: number;
	name: string;
	rank: number;
	score: number;
	pos: [number, number];
	address: string;
	typology: string;
	growth: string;
};

export const stations: Station[] = [
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
export default function PropertiTOD() {
	const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;
	const navigate = useNavigate();

	const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`;

	const [minScore, setMinScore] = useState(0);

	const [showProperty, setShowProperty] = useState(true);
	const [showTypology, setShowTypology] = useState(true);
	const [showSurvey, setShowSurvey] = useState(false);

	const [selectedTypologies, setSelectedTypologies] = useState<string[]>([]);

	const typologies = ["High Growth", "Residential", "Underused"];

	const filteredStations = stations.filter((station) => {
		const scoreMatch = station.score >= minScore;

		const typologyMatch =
			selectedTypologies.length === 0 ||
			selectedTypologies.some((type) =>
				station.typology.toLowerCase().includes(type.toLowerCase()),
			);

		return scoreMatch && typologyMatch;
	});

	const toggleTypology = (type: string) => {
		setSelectedTypologies((current) =>
			current.includes(type)
				? current.filter((item) => item !== type)
				: [...current, type],
		);
	};

	return (
		<Layout>
			<MapContainer
				center={[-6.316, 106.654]}
				zoom={14}
				className="w-full h-full"
				zoomControl={false}
			>
				<TileLayer
					url={cartoUrl}
					attribution="&copy; OpenStreetMap contributors &copy; CARTO"
				/>

				{showProperty &&
					filteredStations.map((st) => (
						<Marker key={st.id} position={st.pos}>
							<Popup minWidth={300}>
								<div className="p-1">
									<div className="flex justify-between items-start mb-2">
										<h3 className="font-bold text-lg m-0">{st.name}</h3>

										<span className="text-xs bg-blue-50 text-blue-500 border border-blue-300 px-2 py-1 rounded-full">
											#{st.rank}
										</span>
									</div>

									<p className="text-xs text-gray-500 mb-4">{st.address}</p>

									<div className="grid grid-cols-2 gap-3 mb-4">
										<div>
											<p className="text-xs text-gray-400">Investment Score</p>

											<p className="font-bold text-blue-600 text-2xl">
												{st.score}
											</p>
										</div>

										<div>
											<p className="text-xs text-gray-400">Growth</p>

											<p className="font-bold text-blue-600 text-2xl">
												{st.growth}
											</p>
										</div>
									</div>

									<div className="bg-gray-50 p-3 rounded-lg mb-4">
										<p className="text-xs text-gray-400">Station Typology</p>

										<p className="font-medium text-blue-600">{st.typology}</p>
									</div>

									<button
										onClick={() => navigate(`/map/tod/stasiun/${st.id}`)}
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
						placeholder="Cari Stasiun"
						className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-full outline-none focus:border-blue-500 text-blue-500 placeholder-blue-400"
					/>
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
		</Layout>
	);
}
