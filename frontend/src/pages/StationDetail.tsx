/** @format */

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";

import L from "leaflet";
import { ArrowLeft, ChevronDown, Info, MapPin, TrainFront, TrendingUp } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import LogoNav from "@/assets/logo/logo-nav.png";
import MapAttribution from "@/components/ui/MapAttribution";
import { type StationML, useStationDetail, useStationForecast, useStations } from "@/hooks/useStations";

// @ts-expect-error Leaflet keeps this private field on its default icon prototype.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const tabs = ["Summary", "Full Trends", "Comparison"] as const;
type Tab = (typeof tabs)[number];

function StationMap({ station }: { station: StationML }) {
	const map = useMap();

	useEffect(() => {
		map.setView(station.coord, 15);
	}, [map, station.coord]);

	return (
		<Marker position={station.coord}>
			<Popup><strong>{station.name}</strong><br />{station.lines.join(" • ")}</Popup>
		</Marker>
	);
}

const formatPercent = (value?: number) => `${(value ?? 0) >= 0 ? "+" : ""}${(value ?? 0).toFixed(1)}%`;

export default function StationDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { stations, loading: stationsLoading } = useStations();
	const [selectedStationId, setSelectedStationId] = useState(id || "sudimara");
	const [comparisonId, setComparisonId] = useState("serpong");
	const [comparisonOpen, setComparisonOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("Summary");
	const { station, insight, loading } = useStationDetail(selectedStationId);
	const { data: forecastData } = useStationForecast(selectedStationId);

	const comparisonStations = useMemo(
		() => stations.filter((item) => item.id !== selectedStationId),
		[stations, selectedStationId],
	);

	const effectiveComparisonId = comparisonStations.some((item) => item.id === comparisonId)
		? comparisonId
		: comparisonStations[0]?.id ?? "";
	const comparison = comparisonStations.find((item) => item.id === effectiveComparisonId);
	const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;
	const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`;

	if (loading || stationsLoading) {
		return <div className="flex min-h-screen items-center justify-center bg-[#f7faff]"><p className="text-sm text-slate-500">Memuat trend dashboard...</p></div>;
	}

	if (!station) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f7faff]">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-slate-900">Stasiun tidak ditemukan</h1>
					<button onClick={() => navigate("/dashboard")} className="rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">Kembali ke Dashboard</button>
				</div>
			</div>
		);
	}

	const comparisonRows = comparison ? [
		["Skor Investasi", station.score.toFixed(1), comparison.score.toFixed(1)],
		["Pertumbuhan Historis", formatPercent(station.growth?.historical_yoy_pct), formatPercent(comparison.growth?.historical_yoy_pct)],
		["Proyeksi 3 Bulan", formatPercent(station.growth?.forecast_3m_pct), formatPercent(comparison.growth?.forecast_3m_pct)],
		["Jumlah Jalur", String(station.lines.length), String(comparison.lines.length)],
		["Peringkat Stasiun", `#${station.rank}`, `#${comparison.rank}`],
	] : [];

	return (
		<div className="min-h-screen bg-[#f7faff] text-slate-800">
			<header className="sticky top-0 z-[1100] border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">
				<div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6 lg:px-8">
					<button type="button" onClick={() => navigate("/dashboard")} className="group flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:px-4">
						<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
						<span className="hidden sm:inline">Kembali</span>
					</button>
					<img src={LogoNav} alt="TCI" className="w-16 sm:w-20" />
					<div className="hidden h-7 w-px bg-slate-200 sm:block" />
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-slate-900">Trend Dashboard</p>
						<p className="hidden text-xs text-slate-400 sm:block">Analisis tren aktivitas stasiun</p>
					</div>
					<div className="relative order-last w-full sm:order-none sm:ml-auto sm:w-auto">
						<select value={selectedStationId} onChange={(event) => setSelectedStationId(event.target.value)} aria-label="Pilih stasiun utama" className="w-full appearance-none truncate rounded-xl border border-blue-100 bg-blue-50 py-2 pl-3 pr-9 text-sm font-medium text-blue-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-auto">
							{stations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
						</select>
						<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
				<section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
					<div className="relative h-72 overflow-hidden rounded-2xl border border-blue-100 bg-slate-100 shadow-sm lg:h-80">
						<MapContainer center={station.coord} zoom={15} scrollWheelZoom={false} className="h-full w-full">
							<TileLayer url={cartoUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' />
							<MapAttribution />
							<StationMap station={station} />
						</MapContainer>
						<div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur">
							<div className="flex items-center gap-2 text-sm font-medium text-slate-700"><MapPin className="h-4 w-4 text-blue-500" />Lokasi {station.name}</div>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
						<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
							<div className="mb-5 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><TrainFront className="h-5 w-5 text-blue-600" /></div>
								<div><p className="text-xs uppercase tracking-wider text-slate-400">Jalur KRL</p><p className="font-semibold text-slate-800">{station.lines.length} jalur terhubung</p></div>
							</div>
							<div className="flex flex-wrap gap-2">{station.lines.map((line) => <span key={line} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">{line}</span>)}</div>
						</div>
						<div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#60d2cd] to-[#3281d8] p-6 text-white shadow-[0_16px_35px_rgba(50,129,216,0.22)]">
							<div><p className="text-xs uppercase tracking-wider text-white/75">Forecast 3 bulan</p><p className="mt-2 text-4xl font-semibold">{formatPercent(station.growth?.forecast_3m_pct)}</p></div>
							<TrendingUp className="h-10 w-10 text-white/80" />
						</div>
					</div>
				</section>

				<section className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
					<div><h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">{station.name}</h1><p className="mt-2 text-slate-500">{station.lines.join(" • ")}</p></div>
					<span className="w-fit rounded-full border border-blue-300 bg-white px-4 py-1.5 font-medium text-blue-600">Rank #{station.rank}</span>
				</section>

				<div className="mb-7 flex gap-6 overflow-x-auto border-b border-slate-200 text-base sm:gap-9 sm:text-lg">
					{tabs.map((tab) => (
						<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 pb-3 transition ${activeTab === tab ? "border-blue-500 font-semibold text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{tab}</button>
					))}
				</div>

				{activeTab === "Summary" && (
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:col-span-2"><p className="text-sm text-slate-400">Tipologi</p><p className="mt-2 text-2xl font-semibold text-blue-600">{station.typology?.label ?? "-"}</p></div>
							<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><p className="text-sm text-slate-400">Growth Rate</p><p className="mt-2 text-3xl font-semibold text-blue-600">{formatPercent(station.growth?.historical_yoy_pct)}</p></div>
							<div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><p className="text-sm text-slate-400">Skor Stasiun</p><p className="mt-2 text-3xl font-semibold text-blue-600">{station.score} <span className="text-base font-normal text-slate-400">/ 100</span></p></div>
						</div>
						<div className="rounded-2xl border border-blue-200 bg-blue-50 p-6"><p className="text-sm font-medium text-blue-400">Insight AI</p><p className="mt-3 text-sm leading-7 text-blue-700">{insight?.text ?? "Insight belum tersedia."}</p></div>
					</div>
				)}

				{activeTab === "Full Trends" && (
					<div className="grid gap-6 lg:grid-cols-2">
						<TrendChart title="Activity Trend (36 Bulan Historis)" data={forecastData?.historical ?? []} dataKey="passengers" color="#3281d8" />
						<TrendChart title="Forecast 3 Bulan" data={forecastData?.forecast ?? []} dataKey="predicted_passengers" color="#34a88b" dots />
					</div>
				)}

				{activeTab === "Comparison" && (
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
							<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm text-slate-500">Bandingkan dengan</p>
								<div className="relative w-full sm:w-56">
									<button
										type="button"
										onClick={() => setComparisonOpen((open) => !open)}
										aria-haspopup="listbox"
										aria-expanded={comparisonOpen}
										className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50 py-2 pl-3 pr-3 text-left text-sm font-semibold text-blue-700 outline-none focus:border-blue-400"
									>
										<span className="truncate">{comparison?.name ?? "Pilih stasiun"}</span>
										<ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${comparisonOpen ? "rotate-180" : ""}`} />
									</button>
									{comparisonOpen && (
										<div role="listbox" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[1200] max-h-64 overflow-y-auto rounded-xl border border-blue-100 bg-white p-1.5 shadow-xl">
											{comparisonStations.map((item) => (
												<button
													key={item.id}
													type="button"
													role="option"
													aria-selected={item.id === effectiveComparisonId}
													onClick={() => {
														setComparisonId(item.id);
														setComparisonOpen(false);
													}}
													className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${item.id === effectiveComparisonId ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}
												>
													{item.name}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
							<div className="grid grid-cols-[minmax(0,1fr)_80px_80px] gap-2 border-b border-slate-100 pb-3 text-xs font-semibold text-slate-400 sm:grid-cols-[minmax(0,1fr)_110px_110px]"><span>Metrik</span><span className="truncate text-center text-blue-600">{station.name}</span><span className="truncate text-center text-teal-600">{comparison?.name}</span></div>
							{comparisonRows.map(([label, current, compared]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_80px_80px] gap-2 border-b border-slate-100 py-4 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_110px_110px]"><span className="text-slate-600">{label}</span><span className="text-center font-semibold text-blue-600">{current}</span><span className="text-center font-semibold text-teal-600">{compared}</span></div>)}
						</div>
						<div className="relative rounded-2xl border border-blue-200 bg-blue-50 p-6">
							<Info className="absolute right-5 top-5 h-5 w-5 text-blue-500" />
							<p className="text-sm font-medium text-blue-400">Ringkasan Perbandingan</p>
							{comparison && <p className="mt-4 leading-7 text-blue-700"><strong>{station.name}</strong> memiliki skor {station.score.toFixed(1)}, sementara <strong>{comparison.name}</strong> memiliki skor {comparison.score.toFixed(1)}. Pertumbuhan historis keduanya masing-masing {formatPercent(station.growth.historical_yoy_pct)} dan {formatPercent(comparison.growth.historical_yoy_pct)}.</p>}
							<p className="mt-4 text-sm leading-6 text-blue-500">Seluruh stasiun pada dataset tersedia sebagai pembanding melalui pilihan di sebelah kiri.</p>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

type ChartPoint = { period: string; passengers?: number; predicted_passengers?: number };

function TrendChart({ title, data, dataKey, color, dots = false }: { title: string; data: ChartPoint[]; dataKey: "passengers" | "predicted_passengers"; color: string; dots?: boolean }) {
	return (
		<div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
			<p className="mb-5 text-sm font-medium text-slate-500">{title}</p>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={260}>
					<LineChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e6edf5" vertical={false} />
						<XAxis dataKey="period" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={data.length > 10 ? 5 : 0} axisLine={{ stroke: "#dbe4ee" }} tickLine={false} />
						<YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`} axisLine={false} tickLine={false} width={45} />
						<Tooltip formatter={(value) => Number(value).toLocaleString("id-ID")} contentStyle={{ borderRadius: 12, borderColor: "#dbeafe" }} />
						<Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={dots ? { fill: color, r: 4, strokeWidth: 0 } : false} activeDot={{ r: 5 }} />
					</LineChart>
				</ResponsiveContainer>
			) : <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">Data tren belum tersedia.</div>}
		</div>
	);
}
