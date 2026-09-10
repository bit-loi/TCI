/** @format */

import { useState } from "react";

import { Link, useLocation } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";
import { useAuth } from "@/hooks/useAuth";

const layers = [
	{
		id: "heatmap",
		label: "Heatmap Hotspot",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
			</svg>
		),
		path: "/map/ekonomi-kawasan",
	},
	{
		id: "tod",
		label: "Property/ TOD",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		),
		path: "/map/tod",
	},
	{
		id: "typology",
		label: "Tipologi Stasiun",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
			</svg>
		),
		path: "/dashboard/typology",
	},
	{
		id: "survey",
		label: "Survei Lapangan",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
				<polyline points="10 9 9 9 8 9" />
			</svg>
		),
		path: "/dashboard/survey",
	},
];

const features = [
	{
		id: "hotspot-finder",
		label: "Hotspot Finder",
		description: "Temukan area hotspot ekonomi di sekitar stasiun KRL dengan analisis spasial berbasis data real-time.",
		tier: "A",
		color: "from-[#60d2cd] to-[#3281d8]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
				<line x1="11" y1="8" x2="11" y2="14" />
				<line x1="8" y1="11" x2="14" y2="11" />
			</svg>
		),
		path: "/map/ekonomi-kawasan",
	},
	{
		id: "investment-score",
		label: "Station Investment Score",
		description: "Skor investasi stasiun berdasarkan potensi ekonomi, aksesibilitas, dan tingkat perkembangan kawasan.",
		tier: "A",
		color: "from-[#60d2cd] to-[#3281d8]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<line x1="12" y1="1" x2="12" y2="23" />
				<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
			</svg>
		),
		path: "/map/tod",
	},
	{
		id: "trend-dashboard",
		label: "Trend Dashboard",
		description: "Dashboard visualisasi tren pertumbuhan ekonomi dan properti di sekitar koridor transportasi massal.",
		tier: "B",
		color: "from-[#3a8fd6] to-[#2f7ed6]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<line x1="18" y1="20" x2="18" y2="10" />
				<line x1="12" y1="20" x2="12" y2="4" />
				<line x1="6" y1="20" x2="6" y2="14" />
			</svg>
		),
		path: "/dashboard/trend",
	},
	{
		id: "station-typology",
		label: "Station Typology",
		description: "Klasifikasi stasiun berdasarkan karakteristik lingkungan sekitar menggunakan machine learning.",
		tier: "A",
		color: "from-[#60d2cd] to-[#3281d8]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
			</svg>
		),
		path: "/dashboard/typology",
	},
	{
		id: "survey-data",
		label: "Survey Data",
		description: "Akses dan kelola data survei lapangan yang dikumpulkan dari responden di sekitar stasiun.",
		tier: "C",
		color: "from-[#60d2cd] to-[#3281d8]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M9 11l3 3L22 4" />
				<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
			</svg>
		),
		path: "/dashboard/survey",
	},
	{
		id: "buffer-analyzer",
		label: "Radius/Buffer Analyzer",
		description: "Analisis zona buffer di sekitar stasiun untuk melihat distribusi POI dan potensi bisnis.",
		tier: "B",
		color: "from-[#3a8fd6] to-[#2f7ed6]",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<circle cx="12" cy="12" r="6" />
				<circle cx="12" cy="12" r="2" />
			</svg>
		),
		path: "/map/ekonomi-kawasan",
	},
];

const tierColors: Record<string, string> = {
	A: "bg-[#3a8fd6] text-white",
	B: "bg-[#60d2cd] text-white",
	C: "bg-[#e0e0e0] text-[#555555]",
};

const tierLabels: Record<string, string> = {
	A: "Advanced",
	B: "Medium",
	C: "Basic",
};

export default function Dashboard() {
	const location = useLocation();
	const { user, signOut } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const userName =
		user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

	return (
		<div className="flex min-h-screen bg-[#f5f8ff] font-sans">
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/30 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e8eef6] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Logo */}
				<div className="flex h-16 items-center border-b border-[#e8eef6] px-6">
					<Link to="/" aria-label="TCI, return to home">
						<img src={LogoNav} alt="Logo TCI" className="h-8 object-cover" />
					</Link>
					<span className="ml-3 text-lg font-semibold color-gradient">
						Dashboard
					</span>
				</div>

				{/* Layers */}
				<div className="flex-1 overflow-y-auto px-4 py-6">
					<p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#868686]">
						Layers
					</p>
					<nav className="flex flex-col gap-1">
						{layers.map((layer) => {
							const isActive = location.pathname === layer.path;
							return (
								<Link
									key={layer.id}
									to={layer.path}
									onClick={() => setSidebarOpen(false)}
									className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
										isActive
											? "bg-[#f0f6ff] text-[#3a8fd6]"
											: "text-[#555555] hover:bg-[#f5f8ff] hover:text-[#3a8fd6]"
									}`}
								>
									<span className={isActive ? "text-[#3a8fd6]" : "text-[#868686]"}>
										{layer.icon}
									</span>
									{layer.label}
								</Link>
							);
						})}
					</nav>

					<div className="my-6 h-px bg-[#e8eef6]" />

					{/* Features */}
					<p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-[#868686]">
						Fitur
					</p>
					<nav className="flex flex-col gap-1">
						{features.map((feature) => {
							const isActive = location.pathname === feature.path;
							return (
								<Link
									key={feature.id}
									to={feature.path}
									onClick={() => setSidebarOpen(false)}
									className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
										isActive
											? "bg-[#f0f6ff] text-[#3a8fd6]"
											: "text-[#555555] hover:bg-[#f5f8ff] hover:text-[#3a8fd6]"
									}`}
								>
									<span className={isActive ? "text-[#3a8fd6]" : "text-[#868686]"}>
										{feature.icon}
									</span>
									{feature.label}
									<span
										className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${tierColors[feature.tier]}`}
									>
										{feature.tier}
									</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* User */}
				<div className="border-t border-[#e8eef6] p-4">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient text-sm font-semibold text-white">
							{userName.charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-black">
								{userName}
							</p>
							<p className="truncate text-xs text-[#868686]">{user?.email}</p>
						</div>
						<button
							onClick={signOut}
							className="rounded-lg p-1.5 text-[#868686] transition-colors hover:bg-red-50 hover:text-red-500"
							aria-label="Logout"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex flex-1 flex-col">
				{/* Top bar */}
				<header className="flex h-16 items-center border-b border-[#e8eef6] bg-white px-4 lg:px-8">
					<button
						onClick={() => setSidebarOpen(true)}
						className="mr-4 rounded-lg p-2 text-[#555555] hover:bg-[#f0f6ff] lg:hidden"
						aria-label="Buka menu"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
					</button>
					<h1 className="text-lg font-semibold text-black">Overview</h1>
				</header>

				{/* Content */}
				<main className="flex-1 overflow-y-auto p-4 lg:p-8">
					{/* Welcome */}
					<div className="mb-8">
						<h2 className="text-2xl font-semibold text-black">
							Halo, {userName} 👋
						</h2>
						<p className="mt-1 text-[#868686]">
							Selamat datang di Transit Commerce Intelligence Dashboard
						</p>
					</div>

					{/* Quick Actions */}
					<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{layers.map((layer) => (
							<Link
								key={layer.id}
								to={layer.path}
								className="group flex items-center gap-4 rounded-2xl border border-[#e8eef6] bg-white p-5 shadow-sm transition-all hover:border-[#3a8fd6]/30 hover:shadow-md"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f6ff] text-[#3a8fd6] transition-colors group-hover:bg-gradient group-hover:text-white">
									{layer.icon}
								</div>
								<span className="text-sm font-medium text-[#555555] transition-colors group-hover:text-[#3a8fd6]">
									{layer.label}
								</span>
							</Link>
						))}
					</div>

					{/* Features Grid */}
					<div className="mb-4">
						<h3 className="text-lg font-semibold text-black">Fitur Analitik</h3>
						<p className="text-sm text-[#868686]">
							Jelajahi fitur-fitur analitik untuk insight transit & ekonomi
						</p>
					</div>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{features.map((feature) => (
							<Link
								key={feature.id}
								to={feature.path}
								className="group relative overflow-hidden rounded-2xl border border-[#e8eef6] bg-white p-6 shadow-sm transition-all hover:border-[#3a8fd6]/30 hover:shadow-lg"
							>
								{/* Gradient accent */}
								<div
									className={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br ${feature.color} opacity-10 transition-opacity group-hover:opacity-20`}
								/>

								<div className="relative">
									<div className="mb-4 flex items-center justify-between">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f6ff] text-[#3a8fd6] transition-colors group-hover:bg-gradient group-hover:text-white">
											{feature.icon}
										</div>
										<span
											className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tierColors[feature.tier]}`}
										>
											{tierLabels[feature.tier]}
										</span>
									</div>

									<h4 className="mb-2 text-base font-semibold text-black">
										{feature.label}
									</h4>
									<p className="text-sm leading-relaxed text-[#868686]">
										{feature.description}
									</p>

									<div className="mt-4 flex items-center text-sm font-medium text-[#3a8fd6] opacity-0 transition-opacity group-hover:opacity-100">
										Buka
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
											<path d="M5 12h14" />
											<path d="m12 5 7 7-7 7" />
										</svg>
									</div>
								</div>
							</Link>
						))}
					</div>
				</main>
			</div>
		</div>
	);
}
