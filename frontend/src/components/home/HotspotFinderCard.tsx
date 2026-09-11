/** @format */

import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import MapBg from "@/assets/img/home-bg.png";

type HotspotFinderCardProps = {
	visible: boolean;
};

const HotspotFinderCard = ({ visible }: HotspotFinderCardProps) => {
	return (
		<Link
			to="/map/ekonomi-kawasan"
			aria-label="Buka Hotspot Finder"
			className={`group relative flex aspect-square w-full flex-col overflow-hidden rounded-[10px] border border-[#e9f1f8] bg-white shadow-[0_18px_50px_rgba(37,99,151,0.13)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,151,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3281d8] ${
				visible ? "animate-card-reveal delay-100" : "opacity-0"
			}`}
		>
			<div className="relative mx-2.5 mt-2.5 min-h-0 flex-1 overflow-hidden rounded-md bg-[#edf5f9] sm:mx-3 sm:mt-3">
				<img
					src={MapBg}
					alt=""
					className="h-full w-full object-cover opacity-55 grayscale-[15%] transition-transform duration-700 group-hover:scale-105"
				/>

				<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_4%,rgba(255,255,255,0.08)_52%,rgba(50,129,216,0.13)_100%)]" />

				<div className="hotspot-grid absolute right-[7%] top-[9%] h-[72%] w-[66%] overflow-hidden rounded-lg opacity-90">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_58%,rgba(50,129,216,0.9),rgba(74,196,205,0.62)_34%,rgba(96,210,205,0.08)_72%)]" />
				</div>

				<div className="absolute left-[16%] top-[55%] max-w-[42%] text-[0.58rem] font-semibold leading-tight text-[#243444] sm:text-xs md:text-[0.68rem] lg:text-xs">
					Stasiun
					<br />
					South Jakarta
				</div>

				<div className="absolute left-[45%] top-[58%]">
					<span className="hotspot-pulse absolute -inset-3 rounded-full bg-[#3281d8]/20" />
					<span className="relative block h-4 w-4 rounded-full border-2 border-white bg-[#1679df] shadow-[0_2px_8px_rgba(50,129,216,0.65)] sm:h-5 sm:w-5" />
				</div>

				<div className="metric-badge absolute right-[4%] top-[5%] z-20 rounded-xl bg-white/95 px-2.5 py-2 text-[#344256] shadow-[0_8px_24px_rgba(44,75,105,0.17)] backdrop-blur sm:right-[6%] sm:top-[7%] sm:rounded-2xl sm:px-3.5 sm:py-2.5">
					<p className="text-[0.48rem] font-medium text-[#68758a] sm:text-[0.62rem] md:text-[0.56rem] lg:text-[0.68rem]">
						Skor Potensi
					</p>
					<div className="mt-0.5 flex items-center gap-1">
						<span className="text-sm font-bold leading-none text-[#152234] sm:text-lg md:text-base lg:text-xl">
							94
						</span>
						<TrendingUp className="h-3 w-3 text-[#23bfb6] sm:h-4 sm:w-4" />
					</div>
				</div>
			</div>

			<div className="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
				<div className="min-w-0">
					<h3 className="text-sm font-semibold leading-tight text-[#111827] sm:text-base md:text-sm lg:text-base">
						Hotspot Finder
					</h3>
					<p className="mt-1 max-w-[90%] text-[0.58rem] leading-relaxed text-[#6b7280] sm:text-[0.68rem] md:text-[0.62rem] lg:text-xs">
						Temukan titik lokasi paling strategis dan potensial
					</p>
				</div>
			</div>
		</Link>
	);
};

export default HotspotFinderCard;
