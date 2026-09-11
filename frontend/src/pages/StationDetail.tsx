/** @format */

import { useState } from "react";

import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { useStationDetail, useStationForecast } from "@/hooks/useStations";

export default function StationDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { station, insight, loading } = useStationDetail(id ?? "");
	const { data: forecastData } = useStationForecast(id ?? "");

	const [activeTab, setActiveTab] = useState("Summary");
	const tabs = ["Summary", "Full Trends", "Comparison"];

	if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-500">Memuat...</p></div>;
	if (!station) return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-4">Stasiun tidak ditemukan</h1>
				<button onClick={() => navigate("/map/tod")} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg">Kembali ke Peta</button>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-white overflow-y-auto">
			<div className="max-w-6xl mx-auto p-6 pt-24 relative">
				<button
					onClick={() => navigate("/map/tod")}
					className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
				>
					<X className="w-6 h-6 text-gray-600" />
				</button>

				<div className="grid grid-cols-3 grid-rows-2 gap-4 h-80 mb-8">
					<div className="col-span-2 row-span-2 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
						<span className="text-sm">Map view for {station.name}</span>
					</div>
					<div className="bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">Lines</div>
					<div className="bg-blue-500 rounded-xl flex items-center justify-center text-white text-4xl font-light">
						+{(station.growth?.forecast_3m_pct ?? 0).toFixed(1)}%
					</div>
				</div>

				<div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">{station.name}</h1>
						<p className="text-gray-500">{station.lines?.join(" • ")}</p>
					</div>
					<span className="text-blue-500 border border-blue-400 px-4 py-1.5 rounded-full font-medium">Rank #{station.rank}</span>
				</div>

				<div className="flex space-x-8 mb-8 text-2xl font-light">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={
								activeTab === tab
									? "text-blue-500 border-b-2 border-blue-500 font-medium pb-2"
									: "text-gray-300 hover:text-gray-400 pb-2"
							}
						>
							{tab}
						</button>
					))}
				</div>

				<div className="grid grid-cols-2 gap-6">
					{activeTab === "Summary" && (
						<>
							<div className="space-y-6">
								<div className="flex gap-4">
								<div className="border border-blue-100 p-6 rounded-xl flex-1">
									<p className="text-blue-300 text-sm mb-2">Typology</p>
									<p className="text-2xl text-blue-500">{station.typology?.label ?? "-"}</p>
								</div>
								<div className="border border-blue-100 p-6 rounded-xl w-1/3">
									<p className="text-blue-300 text-sm mb-2">Growth Rate</p>
									<p className="text-2xl text-blue-500">+{(station.growth?.historical_yoy_pct ?? 0).toFixed(1)}%</p>
								</div>
								</div>
								<div className="bg-blue-50 border border-blue-200 p-6 rounded-xl relative">
									<p className="text-blue-300 text-sm mb-2">Insight AI</p>
									<p className="text-blue-600 leading-relaxed text-sm">{insight?.text ?? "Memuat insight..."}</p>
									<p className="text-blue-300 text-xs mt-2">{station.data_status}</p>
								</div>
							</div>
							<div className="space-y-6">
								<div className="border border-blue-100 p-6 rounded-xl">
									<p className="text-blue-300 text-sm mb-2">Skor Stasiun:</p>
									<p className="text-4xl text-blue-500 font-medium mb-6">{station.score ?? "-"} <span className="text-lg text-gray-400">/ 100</span></p>
									<p className="text-blue-400 text-sm">Rekomendasi usaha: <strong>{station.recommendation?.category}</strong> (confidence {(station.recommendation?.confidence ?? 0) * 100}%)</p>
								</div>
							</div>
						</>
					)}

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
									Perbandingan antar stasiun akan tersedia setelah skor untuk
									semua stasiun selesai dihitung.
								</p>

								<p className="text-blue-600 leading-relaxed">
									Skor dan tren yang ditampilkan saat ini masih berupa
									contoh dan belum merepresentasikan hasil analisis
									stasiun ini.
								</p>
							</div>
						</>
					)}

					{activeTab === "Full Trends" && (
						<>
							<div className="border border-blue-100 rounded-xl p-6">
								<p className="text-blue-300 text-sm mb-4">Activity Trend (36 Bulan Historis)</p>
								{forecastData?.historical ? (
									<ResponsiveContainer width="100%" height={220}>
										<LineChart data={forecastData.historical}>
											<CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
											<XAxis dataKey="period" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={5} />
											<YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000000).toFixed(1) + "M"} />
											<Tooltip formatter={(v) => (v as number)?.toLocaleString() ?? "-"} />
											<Line type="monotone" dataKey="passengers" stroke="#3b82f6" strokeWidth={2} dot={false} />
										</LineChart>
									</ResponsiveContainer>
								) : (
									<p className="text-gray-400 text-sm h-48 flex items-center justify-center">Memuat...</p>
								)}
							</div>
							<div className="border border-blue-100 rounded-xl p-6">
								<p className="text-blue-300 text-sm mb-4">Forecast 3 Bulan</p>
								{forecastData?.forecast ? (
									<ResponsiveContainer width="100%" height={220}>
										<LineChart data={forecastData.forecast}>
											<CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
											<XAxis dataKey="period" tick={{ fontSize: 10, fill: "#9ca3af" }} />
											<YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000000).toFixed(1) + "M"} />
											<Tooltip formatter={(v) => (v as number)?.toLocaleString() ?? "-"} />
											<Line type="monotone" dataKey="predicted_passengers" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
										</LineChart>
									</ResponsiveContainer>
								) : (
									<p className="text-gray-400 text-sm h-48 flex items-center justify-center">Memuat...</p>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
