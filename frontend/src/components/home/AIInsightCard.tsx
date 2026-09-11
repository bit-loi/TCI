/** @format */

import { Link } from "react-router-dom";

import BaseMap from "@/assets/img/Frame 5.png";
import StationImage from "@/assets/img/Rectangle 123.png";

type AIInsightCardProps = {
	visible: boolean;
};

const AIInsightCard = ({ visible }: AIInsightCardProps) => {
	return (
		<Link
			to="/dashboard"
			aria-label="Buka AI Insight Panel and Smart Query"
			className={`group col-span-2 flex aspect-[2.1/1] w-full flex-col overflow-hidden rounded-[10px] border border-[#e9f1f8] bg-white shadow-[0_18px_50px_rgba(37,99,151,0.13)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,151,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3281d8] ${
				visible ? "animate-card-reveal delay-200" : "opacity-0"
			}`}
		>
			<div className="relative mx-2.5 mt-2.5 min-h-0 flex-1 overflow-hidden rounded-md bg-[#f4f8fc] sm:mx-3 sm:mt-3">
				<img
					src={BaseMap}
					alt=""
					className="absolute inset-0 h-full w-full object-cover object-left transition-transform duration-700 group-hover:scale-[1.02]"
				/>

				<div className="absolute left-[34%] top-[45%]">
					<span className="ai-location-pulse absolute -inset-2.5 rounded-full bg-[#2384e5]/25" />
					<span className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#2384e5] shadow-[0_2px_8px_rgba(35,132,229,0.65)] sm:h-4 sm:w-4" />
				</div>

				<div className="absolute inset-y-0 right-[3%] flex w-[45%] items-center">
					<div className="ai-insight-panel flex h-[68%] w-full items-center gap-2 rounded-[8px] border border-[#edf2f7] bg-white p-2 shadow-[0_8px_22px_rgba(62,89,116,0.13)] sm:gap-3 sm:p-2.5">
						<img
							src={StationImage}
							alt="Stasiun Cisauk"
							className="h-full w-[39%] shrink-0 rounded object-cover shadow-sm"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-[0.42rem] font-semibold leading-none text-[#687586] sm:text-[0.56rem] md:text-[0.48rem] lg:text-[0.62rem]">
								Insight lokasi
							</p>
							<p className="mt-1 text-[0.36rem] leading-[1.2] text-[#929ba6] sm:text-[0.48rem] md:text-[0.41rem] lg:text-[0.54rem]">
								Aktivitas stasiun memicu pergerakan konsumen
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
				<h3 className="text-base font-semibold leading-tight text-[#111827] sm:text-xl md:text-lg lg:text-2xl">
					AI Insight Panel and Smart Query
				</h3>
				<p className="mt-1 text-[0.62rem] leading-relaxed text-[#9a9a9a] sm:text-sm md:text-xs lg:text-base">
					Rekomendasi usaha tepat sasaran &amp; analisis potensi investasi
					stasiun berbasis AI
				</p>
			</div>
		</Link>
	);
};

export default AIInsightCard;
