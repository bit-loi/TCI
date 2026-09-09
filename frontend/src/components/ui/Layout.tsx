/** @format */

import { Link, useLocation, useNavigate } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";

export default function Layout({ children }: any) {
	const location = useLocation();
	const navigate = useNavigate();

	const isEkonomi = location.pathname.includes("ekonomi-kawasan");

	return (
		<div className="relative w-full h-screen bg-gray-300 overflow-hidden font-sans">
			{/* Map Content Layer */}
			<div className="absolute inset-0 z-0">{children}</div>

			{/* Floating Header */}
			<div className="absolute top-4 left-4 right-4 z-[1000]">
				<div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center max-w-7xl mx-auto">
					{/* Logo */}
					<div className="flex items-center space-x-2 text-blue-600 font-bold text-2xl">
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

					{/* Navigation Buttons */}
					<div className="flex space-x-4">
						<button
							onClick={() => navigate("/map/ekonomi-kawasan")}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								isEkonomi
									? "bg-blue-500 text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							Layer Ekonomi Kawasan
						</button>
						<button
							onClick={() => navigate("/map/tod")}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								!isEkonomi
									? "bg-blue-500 text-white shadow-sm"
									: "border border-gray-300 text-blue-500 hover:bg-blue-50"
							}`}
						>
							Layer Properti/ TOD
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
