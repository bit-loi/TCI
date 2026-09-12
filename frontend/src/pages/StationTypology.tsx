/** @format */

import { useState } from "react";

import { ArrowLeft, ArrowRightLeft, GitFork, Info, LayoutPanelTop, TrainFront } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";

type TopologyId = "terminal" | "through" | "junction" | "platform";

type Topology = {
	id: TopologyId;
	label: string;
	english: string;
	description: string;
	detail: string;
	icon: typeof TrainFront;
	accent: string;
};

const topologies: Topology[] = [
	{
		id: "terminal",
		label: "Stasiun Ujung",
		english: "Terminal / Dead-end Station",
		description: "Jalur rel berakhir di stasiun dan kereta harus berbalik arah untuk keluar.",
		detail: "Umumnya dilengkapi jalur langsir atau fasilitas perpindahan kabin masinis untuk mendukung perjalanan balik.",
		icon: TrainFront,
		accent: "#ef8354",
	},
	{
		id: "through",
		label: "Stasiun Antara",
		english: "Through Station",
		description: "Jalur rel melintas langsung tanpa putus menuju stasiun berikutnya.",
		detail: "Konfigurasi ini mendukung pergerakan kereta menerus dan biasanya menjadi bentuk paling umum pada suatu koridor.",
		icon: ArrowRightLeft,
		accent: "#3281d8",
	},
	{
		id: "junction",
		label: "Stasiun Percabangan",
		english: "Junction Station",
		description: "Memiliki wesel dan percabangan yang menghubungkan dua atau lebih koridor.",
		detail: "Operasinya membutuhkan pengaturan rute dan persinyalan yang lebih kompleks karena terdapat beberapa arah perjalanan.",
		icon: GitFork,
		accent: "#7c65d6",
	},
	{
		id: "platform",
		label: "Peron Pulau vs. Sisi",
		english: "Island vs. Side Platform",
		description: "Penataan posisi peron terhadap jalur untuk mengatur arus penumpang dan armada.",
		detail: "Peron pulau berada di antara dua jalur, sedangkan peron sisi berada di tepi luar masing-masing jalur.",
		icon: LayoutPanelTop,
		accent: "#24a78e",
	},
];

export default function StationTypology() {
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = useState<TopologyId>("terminal");
	const selected = topologies.find((topology) => topology.id === selectedId) ?? topologies[0];

	return (
		<div className="min-h-screen bg-[#f7faff] text-slate-800">
			<header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">
				<div className="mx-auto flex min-h-20 max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="group flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:px-4"
					>
						<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
						<span className="hidden sm:inline">Kembali</span>
					</button>
					<img src={LogoNav} alt="TCI" className="w-16 sm:w-20" />
					<div className="hidden h-7 w-px bg-slate-200 sm:block" />
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-slate-950 sm:text-base">Topologi Stasiun</p>
						<p className="hidden text-xs text-slate-400 sm:block">Transportasi & Perkeretaapian</p>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
				<section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#163c68] via-[#286fae] to-[#60d2cd] px-6 py-10 text-white shadow-[0_24px_60px_rgba(39,105,164,0.2)] sm:px-10 lg:px-14 lg:py-14">
					<div className="max-w-3xl">
						<p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Panduan Infrastruktur Rel</p>
						<h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Memahami konfigurasi jalur dan peron stasiun</h1>
						<p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">Topologi menjelaskan bagaimana jalur, wesel, dan peron disusun secara fisik. Konfigurasi ini memengaruhi arah perjalanan, kapasitas operasi, serta arus perpindahan penumpang.</p>
					</div>
				</section>

				<section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Jenis topologi stasiun">
					{topologies.map((topology) => {
						const Icon = topology.icon;
						const active = topology.id === selectedId;
						return (
							<button
								key={topology.id}
								type="button"
								onClick={() => setSelectedId(topology.id)}
								className={`rounded-2xl border p-5 text-left transition duration-200 ${active ? "-translate-y-1 border-blue-300 bg-white shadow-[0_14px_32px_rgba(50,129,216,0.16)]" : "border-slate-200 bg-white/70 hover:border-blue-200 hover:bg-white"}`}
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${topology.accent}16`, color: topology.accent }}><Icon className="h-5 w-5" /></div>
								<p className="mt-4 font-semibold text-slate-900">{topology.label}</p>
								<p className="mt-1 text-xs text-slate-400">{topology.english}</p>
							</button>
						);
					})}
				</section>

				<section className="mt-6 grid overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
					<div className="flex min-h-[340px] items-center justify-center bg-[#f2f7fc] p-5 sm:p-8">
						<TopologyDiagram type={selected.id} accent={selected.accent} />
					</div>
					<div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">{selected.english}</p>
						<h2 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">{selected.label}</h2>
						<p className="mt-5 leading-7 text-slate-600">{selected.description}</p>
						<p className="mt-4 text-sm leading-6 text-slate-500">{selected.detail}</p>
						<div className="mt-7 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
							<Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
							<p>Klasifikasi ini membahas bentuk fisik jaringan rel. Ini berbeda dari tipologi kawasan berbasis aktivitas ekonomi atau potensi investasi.</p>
						</div>
					</div>
				</section>

				<section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
					<h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Ringkasan identifikasi</h2>
					<div className="mt-6 overflow-x-auto">
						<table className="w-full min-w-[680px] text-left text-sm">
							<thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><th className="pb-4 pr-5">Jenis</th><th className="pb-4 pr-5">Ciri utama</th><th className="pb-4 pr-5">Pergerakan kereta</th><th className="pb-4">Komponen penting</th></tr></thead>
							<tbody className="divide-y divide-slate-100 text-slate-600">
								<tr><td className="py-4 pr-5 font-semibold text-slate-800">Stasiun Ujung</td><td className="py-4 pr-5">Rel berakhir</td><td className="py-4 pr-5">Berbalik arah</td><td className="py-4">Jalur langsir</td></tr>
								<tr><td className="py-4 pr-5 font-semibold text-slate-800">Stasiun Antara</td><td className="py-4 pr-5">Rel menerus</td><td className="py-4 pr-5">Melaju langsung</td><td className="py-4">Jalur utama</td></tr>
								<tr><td className="py-4 pr-5 font-semibold text-slate-800">Percabangan</td><td className="py-4 pr-5">Dua atau lebih koridor</td><td className="py-4 pr-5">Beberapa arah</td><td className="py-4">Wesel & persinyalan</td></tr>
								<tr><td className="py-4 pr-5 font-semibold text-slate-800">Peron</td><td className="py-4 pr-5">Pulau atau sisi</td><td className="py-4 pr-5">Tergantung susunan jalur</td><td className="py-4">Akses penumpang</td></tr>
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	);
}

function TopologyDiagram({ type, accent }: { type: TopologyId; accent: string }) {
	return (
		<svg viewBox="0 0 520 300" className="h-auto w-full max-w-xl" role="img" aria-label={`Diagram ${type}`}>
			<rect x="1" y="1" width="518" height="298" rx="24" fill="white" stroke="#dce8f3" />
			{type === "terminal" && <>
				<Track x1={65} y1={115} x2={415} y2={115} /><Track x1={65} y1={185} x2={415} y2={185} />
				<line x1="415" y1="95" x2="415" y2="205" stroke={accent} strokeWidth="10" strokeLinecap="round" />
				<Platform x={245} y={132} width={135} /><Train x={350} y={98} color={accent} />
				<Arrow x1={205} y1={78} x2={105} y2={78} color={accent} />
				<text x="260" y="250" textAnchor="middle" fill="#64748b" fontSize="14">Rel berakhir • Kereta berbalik arah</text>
			</>}
			{type === "through" && <>
				<Track x1={35} y1={110} x2={485} y2={110} /><Track x1={35} y1={190} x2={485} y2={190} />
				<Platform x={190} y={132} width={140} /><Train x={350} y={93} color={accent} />
				<Arrow x1={90} y1={72} x2={430} y2={72} color={accent} />
				<text x="260" y="250" textAnchor="middle" fill="#64748b" fontSize="14">Jalur menerus ke stasiun berikutnya</text>
			</>}
			{type === "junction" && <>
				<Track x1={35} y1={115} x2={485} y2={115} /><Track x1={35} y1={185} x2={485} y2={185} />
				<line x1="235" y1="115" x2="405" y2="44" stroke="#66788a" strokeWidth="7" strokeLinecap="round" />
				<line x1="235" y1="185" x2="405" y2="256" stroke="#66788a" strokeWidth="7" strokeLinecap="round" />
				<circle cx="235" cy="115" r="9" fill={accent} /><circle cx="235" cy="185" r="9" fill={accent} />
				<Platform x={70} y={132} width={135} /><Train x={120} y={98} color={accent} />
				<text x="355" y="151" textAnchor="middle" fill="#64748b" fontSize="14">Wesel / turnout</text>
			</>}
			{type === "platform" && <>
				<text x="130" y="45" textAnchor="middle" fill="#334155" fontSize="15" fontWeight="600">Peron Pulau</text>
				<Track x1={45} y1={90} x2={215} y2={90} /><Track x1={45} y1={210} x2={215} y2={210} /><Platform x={72} y={112} width={115} />
				<text x="390" y="45" textAnchor="middle" fill="#334155" fontSize="15" fontWeight="600">Peron Sisi</text>
				<Track x1={305} y1={120} x2={475} y2={120} /><Track x1={305} y1={180} x2={475} y2={180} />
				<rect x="325" y="67" width="130" height="30" rx="8" fill={accent} opacity="0.22" stroke={accent} /><rect x="325" y="203" width="130" height="30" rx="8" fill={accent} opacity="0.22" stroke={accent} />
			</>}
		</svg>
	);
}

function Track({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
	return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#66788a" strokeWidth="7" strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9e1e8" strokeWidth="2" strokeDasharray="9 8" /></g>;
}

function Platform({ x, y, width }: { x: number; y: number; width: number }) {
	return <rect x={x} y={y} width={width} height="36" rx="10" fill="#dcecff" stroke="#8cbced" />;
}

function Train({ x, y, color }: { x: number; y: number; color: string }) {
	return <g transform={`translate(${x} ${y})`}><rect width="48" height="34" rx="9" fill={color} /><rect x="8" y="7" width="13" height="9" rx="2" fill="white" opacity="0.85" /><rect x="27" y="7" width="13" height="9" rx="2" fill="white" opacity="0.85" /><circle cx="13" cy="34" r="4" fill="#334155" /><circle cx="35" cy="34" r="4" fill="#334155" /></g>;
}

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
	return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="4" strokeLinecap="round" /><path d={`M ${x2} ${y2} l 14 -8 l 0 16 z`} fill={color} /></g>;
}
