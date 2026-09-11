/** @format */

import { Link, useLocation, useNavigate } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";

export default function Layout({ children }: any) {
	const location = useLocation();
	const navigate = useNavigate();

	const isEkonomi = location.pathname.includes("ekonomi-kawasan");

	return (
		<div className="relative h-screen w-full overflow-hidden bg-gray-300 font-sans">
			<div className="absolute inset-0 z-0">{children}</div>
			<div className="absolute inset-x-4 top-4 z-[1000]">
				<div className="mx-auto flex max-w-7xl items-center justify-between rounded-xl bg-white p-4 shadow-md">
					<div className="flex items-center text-2xl font-bold text-blue-600">
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
					<div className="flex gap-2 sm:gap-4">
						<button
							onClick={() => navigate("/map/ekonomi-kawasan")}
							className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
								isEkonomi
									? "bg-gradient text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							Layer Ekonomi Kawasan
						</button>

						<button
							onClick={() => navigate("/map/tod")}
							className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
								!isEkonomi
									? "bg-gradient text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							Layer Properti/ TOD
						</button>
					</div>
				</div>
			</div>
			<div className="absolute left-4  z-[1000] sm:top-[104px]">
				<Link
					to="/dashboard"
					className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
					aria-label="Kembali ke Dashboard"
					title="Kembali ke Dashboard"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2.5}
						stroke="currentColor"
						className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>

					<span>Kembali</span>
				</Link>
			</div>
		</div>
	);
}
