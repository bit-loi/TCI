/** @format */

import { useMemo, useState } from "react";

import L from "leaflet";
import {
	AlertCircle,
	Layers,
	Loader2,
	MapPin,
	Ruler,
	Search,
} from "lucide-react";
import {
	Circle,
	CircleMarker,
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";

import Layout from "@/components/ui/Layout";
import MapAttribution from "@/components/ui/MapAttribution";
import { KRL_STATIONS, type Station } from "@/data/krl_stations";

// @ts-expect-error Leaflet keeps this private field on its default icon prototype.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Poi = {
	id: string;
	name: string;
	lat: number;
	lng: number;
	type: string;
	category: string;
};

type OverpassElement = {
	type: string;
	id: string | number;
	lat?: number;
	lon?: number;
	center?: { lat?: number; lon?: number };
	tags?: Record<string, string>;
};

type OverpassResponse = { elements?: OverpassElement[]; raw?: string };

function MapFocus({ station }: { station: Station | null }) {
	const map = useMap();

	if (station) {
		map.flyTo(station.coord, 15, {
			duration: 0.8,
		});
	}

	return null;
}

function buildPoiQuery(station: Station, radius: number, category: string) {
	const [lat, lng] = station.coord;

	const categoryQuery: Record<string, string> = {
		Makanan: `
			["amenity"~"restaurant|fast_food|food_court"]
		`,
		Minuman: `
			["amenity"~"cafe|bar"]
		`,
		Hobi: `
			["shop"~"sports|toys|games|music|hobby"]
		`,
		"Toko Buku": `
			["shop"="books"]
		`,
		Lainnya: `
			["shop"]
		`,
	};

	const filter = categoryQuery[category] ?? categoryQuery.Makanan;

	return `
		[out:json][timeout:8];
		(
			node${filter}(around:${radius},${lat},${lng});
			way${filter}(around:${radius},${lat},${lng});
		);
		out center tags;
	`;
}

async function fetchOverpass(query: string, signal: AbortSignal): Promise<OverpassResponse> {
	try {
		const response = await fetch("/api/overpass", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: `data=${encodeURIComponent(query)}`,
			signal,
		});

		if (!response.ok) {
			throw new Error(`Overpass HTTP ${response.status}`);
		}

		const json = await response.json();
		// Backend returns parsed JSON from Overpass. Extract elements if present.
		if (json && typeof json === "object" && Array.isArray(json.elements)) {
			return json;
		}
		// If backend returned raw text wrapper, try to parse it.
		if (json && typeof json === "object" && typeof json.raw === "string") {
			try {
				const parsed = JSON.parse(json.raw);
				if (parsed && typeof parsed === "object" && Array.isArray(parsed.elements)) {
					return parsed;
				}
			} catch {
				// raw text is not valid JSON
			}
		}
		throw new Error("Unexpected Overpass response shape");
	} catch (error) {
		if (signal.aborted) {
			throw error;
		}
		throw error;
	}
}

function parsePois(data: OverpassResponse, category: string): Poi[] {
	const elements = Array.isArray(data?.elements) ? data.elements : [];

	return elements
		.map((element) => {
			const lat = element.lat ?? element.center?.lat;

			const lng = element.lon ?? element.center?.lon;

			if (typeof lat !== "number" || typeof lng !== "number") {
				return null;
			}

			const tags = element.tags ?? {};

			let type = "POI";

			if (tags.amenity) {
				type = tags.amenity;
			} else if (tags.shop) {
				type = tags.shop;
			}

			const name = tags.name || tags["name:id"] || "Unnamed POI";

			return {
				id: `${element.type}-${element.id}`,
				name,
				lat,
				lng,
				type,
				category,
			};
		})
		.filter(Boolean) as Poi[];
}

function getCategoryColor(category: string) {
	switch (category) {
		case "Makanan":
			return "#ef4444";
		case "Minuman":
			return "#3b82f6";
		case "Hobi":
			return "#8b5cf6";
		case "Toko Buku":
			return "#f59e0b";
		default:
			return "#10b981";
	}
}

export default function EkonomiKawasan() {
	const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;
	const navigate = useNavigate();

	const center: [number, number] = [-6.321, 106.643];

	const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`;

	const [search, setSearch] = useState("");
	const [selectedStation, setSelectedStation] = useState<Station | null>(null);

	const [selectedCategory, setSelectedCategory] = useState("Makanan");

	const [radius, setRadius] = useState(750);

	const [showStations, setShowStations] = useState(true);
	const [showHotspot, setShowHotspot] = useState(true);
	const [showSurvey, setShowSurvey] = useState(false);
	const [showBuffer, setShowBuffer] = useState(false);

	const [pois, setPois] = useState<Poi[]>([]);
	const [loadingPoi, setLoadingPoi] = useState(false);
	const [poiError, setPoiError] = useState("");

	const [poiCache, setPoiCache] = useState<Record<string, Poi[]>>({});

	const filteredStations = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		if (!keyword) {
			return KRL_STATIONS;
		}

		return KRL_STATIONS.filter((station) => {
			return (
				station.name.toLowerCase().includes(keyword) ||
				station.lines.some((line) => line.toLowerCase().includes(keyword))
			);
		});
	}, [search]);

	const selectStation = async (
		station: Station,
		options?: { category?: string; radius?: number },
	) => {
		const activeCategory = options?.category ?? selectedCategory;
		const activeRadius = options?.radius ?? radius;

		setSelectedStation(station);
		setPoiError("");
		setShowBuffer(true);

		const cacheKey = `${station.id}-${activeRadius}-${activeCategory}`;

		const cached = poiCache[cacheKey];

		if (cached) {
			setPois(cached);
			return;
		}

		setLoadingPoi(true);

		const controller = new AbortController();

		const timeout = window.setTimeout(() => {
			controller.abort();
		}, 22_000);

		try {
			const query = buildPoiQuery(station, activeRadius, activeCategory);

			const data = await fetchOverpass(query, controller.signal);

			const parsed = parsePois(data, activeCategory);

			setPois(parsed);

			setPoiCache((previous) => ({
				...previous,
				[cacheKey]: parsed,
			}));
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				setPoiError("Data POI belum tersedia. Overpass timeout.");
			} else {
				setPoiError("Data POI gagal dimuat. Coba lagi.");
			}

			setPois([]);
		} finally {
			window.clearTimeout(timeout);
			setLoadingPoi(false);
		}
	};

	const refreshPoi = () => {
		if (!selectedStation) {
			return;
		}

		const cacheKey = `${selectedStation.id}-${radius}-${selectedCategory}`;

		setPoiCache((previous) => {
			const next = { ...previous };
			delete next[cacheKey];
			return next;
		});

		void selectStation(selectedStation);
	};

	const hotspotColor = getCategoryColor(selectedCategory);

	return (
		<Layout>
			<div className="relative w-full h-full">
				<MapContainer
					center={center}
					zoom={12}
					className="w-full h-full"
					zoomControl={false}
				>
					<TileLayer
						url={cartoUrl}
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
					/>
					<MapAttribution />

					<MapFocus station={selectedStation} />

					{showBuffer && selectedStation && (
						<Circle
							center={selectedStation.coord}
							radius={radius}
							pathOptions={{
								color: "#3b82f6",
								fillColor: "#3b82f6",
								fillOpacity: 0.08,
								weight: 2,
							}}
						/>
					)}

					{showStations &&
						KRL_STATIONS.map((station) => (
							<Marker
								key={station.id}
								position={station.coord}
								eventHandlers={{
									click: () => void selectStation(station),
								}}
							>
								<Popup>
									<div className="min-w-[180px]">
										<p className="font-semibold text-gray-800">
											{station.name}
										</p>

										<p className="text-xs text-gray-500 mt-1">
											{station.lines.join(" • ")}
										</p>

										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												navigate(`/map/tod/stasiun/${station.id}`);
											}}
											className="mt-3 w-full cursor-pointer rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
										>
											Analyze Station
										</button>
									</div>
								</Popup>
							</Marker>
						))}

					{showHotspot &&
						pois.map((poi) => (
							<CircleMarker
								key={poi.id}
								center={[poi.lat, poi.lng]}
								radius={7}
								pathOptions={{
									color: hotspotColor,
									fillColor: hotspotColor,
									fillOpacity: 0.55,
									weight: 1,
								}}
							>
								<Popup>
									<div className="min-w-[170px]">
										<p className="font-semibold text-gray-800">{poi.name}</p>

										<p className="text-xs text-gray-500 mt-1">{poi.type}</p>

										<p className="text-xs text-blue-500 mt-2">
											{selectedCategory}
										</p>
									</div>
								</Popup>
							</CircleMarker>
						))}

					{showSurvey && <></>}
				</MapContainer>

				<div className="absolute inset-x-3 bottom-3 z-[1000] max-h-[58vh] overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-2xl md:inset-x-auto md:bottom-auto md:left-4 md:top-28 md:max-h-[calc(100vh-8rem)] md:w-80 md:rounded-xl md:p-5 md:shadow-lg">
					<div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden="true" />
					<div className="relative mb-4">
						<Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Cari Stasiun"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-full outline-none focus:border-blue-500 text-blue-500 placeholder-blue-400"
						/>
					</div>

					<div className="mb-5 max-h-32 space-y-1 overflow-y-auto sm:max-h-40 md:max-h-44">
						{filteredStations.map((station) => {
							const active = selectedStation?.id === station.id;

							return (
								<button
									key={station.id}
									type="button"
									onClick={() => void selectStation(station)}
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
									type="button"
									onClick={() => {
										setSelectedCategory(category);

										if (selectedStation) {
											void selectStation(selectedStation, { category });
										}
									}}
									className={`px-3 py-1.5 rounded-full text-xs border transition ${
										selectedCategory === category
											? "bg-blue-500 text-white border-blue-500"
											: "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
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
								const nextRadius = Number(e.target.value);

								setRadius(nextRadius);
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
						<label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
							<span>Stasiun KRL</span>

							<input
								type="checkbox"
								checked={showStations}
								onChange={(e) => setShowStations(e.target.checked)}
								className="accent-blue-500"
							/>
						</label>

						<label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
							<span>Heatmap Hotspot</span>

							<input
								type="checkbox"
								checked={showHotspot}
								onChange={(e) => setShowHotspot(e.target.checked)}
								className="accent-blue-500"
							/>
						</label>

						<label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
							<span>Survei Lapangan</span>

							<input
								type="checkbox"
								checked={showSurvey}
								onChange={(e) => setShowSurvey(e.target.checked)}
								className="accent-blue-500"
							/>
						</label>

						<label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
							<span>Radius / Buffer</span>

							<input
								type="checkbox"
								checked={showBuffer}
								onChange={(e) => setShowBuffer(e.target.checked)}
								className="accent-blue-500"
							/>
						</label>
					</div>
				</div>

				{selectedStation && (
					<div className="absolute right-4 top-28 z-[1000] hidden w-80 rounded-xl bg-white p-5 shadow-lg md:block">
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

							<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
								<MapPin className="w-4 h-4 text-blue-500" />
							</div>
						</div>

						<div className="border-t border-gray-100 my-4" />

						<div className="grid grid-cols-2 gap-3">
							<div className="bg-gray-50 rounded-lg p-3">
								<p className="text-[10px] uppercase tracking-wider text-gray-400">
									POI
								</p>

								<p className="text-xl font-semibold text-gray-800 mt-1">
									{loadingPoi ? (
										<Loader2 className="w-5 h-5 animate-spin text-blue-500" />
									) : (
										pois.length
									)}
								</p>
							</div>

							<div className="bg-gray-50 rounded-lg p-3">
								<p className="text-[10px] uppercase tracking-wider text-gray-400">
									Radius
								</p>

								<p className="text-xl font-semibold text-gray-800 mt-1">
									{radius}m
								</p>
							</div>
						</div>

						<div className="mt-4">
							<p className="text-xs text-gray-400 uppercase tracking-wider">
								Category
							</p>

							<p className="text-sm font-medium text-gray-700 mt-1">
								{selectedCategory}
							</p>
						</div>

						{loadingPoi && (
							<div className="mt-4 flex items-center gap-2 text-xs text-blue-500">
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Mencari POI sekitar stasiun...</span>
							</div>
						)}

						{poiError && (
							<div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
								<div className="flex gap-2">
									<AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />

									<div>
										<p className="text-xs font-medium text-amber-700">
											POI belum tersedia
										</p>

										<p className="text-[11px] text-amber-600 mt-1">
											{poiError}
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={refreshPoi}
									className="mt-2 text-xs font-medium text-blue-500 hover:text-blue-600"
								>
									Coba lagi
								</button>
							</div>
						)}

						{!loadingPoi && !poiError && pois.length > 0 && (
							<div className="mt-4 rounded-lg bg-blue-50 p-3">
								<p className="text-xs font-medium text-blue-700">
									Spatial Insight
								</p>

								<p className="text-xs text-blue-600 mt-1 leading-relaxed">
									Ditemukan <strong>{pois.length}</strong> POI{" "}
									{selectedCategory.toLowerCase()} dalam radius {radius}m dari{" "}
									{selectedStation.name}.
								</p>
							</div>
						)}

						{!loadingPoi && !poiError && pois.length === 0 && (
							<div className="mt-4 rounded-lg bg-gray-50 p-3">
								<p className="text-xs text-gray-500">
									Belum ada POI {selectedCategory.toLowerCase()} yang ditemukan
									dalam radius tersebut.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</Layout>
	);
}
