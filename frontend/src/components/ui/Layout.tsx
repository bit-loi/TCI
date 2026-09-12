/** @format */

import type { ReactNode } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";

export default function Layout({ children }: { children: ReactNode }) {
	const location = useLocation();
	const navigate = useNavigate();

	const isEkonomi = location.pathname.includes("ekonomi-kawasan");

	return (
		<div className="relative h-screen w-full overflow-hidden bg-gray-300 font-sans">
			<div className="absolute inset-0 z-0">{children}</div>
			<div className="absolute inset-x-3 top-3 z-[1000] md:inset-x-4 md:top-4">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-md md:flex-nowrap md:gap-5 md:rounded-xl md:p-4">
					<Link
						to="/dashboard"
						className="group flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
						aria-label="Kembali ke Dashboard"
						title="Kembali ke Dashboard"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
						</svg>
						<span className="hidden sm:inline">Kembali</span>
					</Link>
					<div className="flex shrink-0 items-center text-2xl font-bold text-blue-600">
						<Link
							to="/"
							className="w-16 sm:w-20"
							aria-label="TCI, return to home"
						>
							<img
								className="w-full object-cover"
								src={LogoNav}
								alt="Logo TCI"
							/>
						</Link>
					</div>
					<div className="order-last grid w-full grid-cols-2 gap-2 md:order-none md:ml-auto md:flex md:w-auto md:gap-4">
						<button
							onClick={() => navigate("/map/ekonomi-kawasan")}
							className={`min-h-11 cursor-pointer rounded-xl px-2 py-2 text-xs font-medium leading-tight transition-colors sm:px-4 sm:text-sm md:rounded-lg md:px-6 md:text-base ${
								isEkonomi
									? "bg-gradient text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							<span className="sm:hidden">Ekonomi</span>
							<span className="hidden sm:inline">Layer Ekonomi Kawasan</span>
						</button>

						<button
							onClick={() => navigate("/map/tod")}
							className={`min-h-11 cursor-pointer rounded-xl px-2 py-2 text-xs font-medium leading-tight transition-colors sm:px-4 sm:text-sm md:rounded-lg md:px-6 md:text-base ${
								!isEkonomi
									? "bg-gradient text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							<span className="sm:hidden">Properti / TOD</span>
							<span className="hidden sm:inline">Layer Properti/ TOD</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
