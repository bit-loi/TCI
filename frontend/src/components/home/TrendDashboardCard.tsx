/** @format */

import { Link } from "react-router-dom";

type TrendDashboardCardProps = {
	visible: boolean;
};

const points = [
	{ x: 24, y: 112 },
	{ x: 68, y: 93 },
	{ x: 112, y: 91 },
	{ x: 156, y: 70 },
	{ x: 200, y: 57 },
	{ x: 244, y: 34 },
];

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
const bars = [46, 70, 66, 88, 102, 116];

const TrendDashboardCard = ({ visible }: TrendDashboardCardProps) => {
	return (
		<Link
			to="/dashboard"
			aria-label="Buka Trend Dashboard"
			className={`group relative flex aspect-square w-full flex-col overflow-hidden rounded-[10px] border border-[#e9f1f8] bg-white shadow-[0_18px_50px_rgba(37,99,151,0.13)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,151,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3281d8] ${
				visible ? "animate-card-reveal delay-200" : "opacity-0"
			}`}
		>
			<div className="relative mx-2.5 mt-2.5 min-h-0 flex-1 overflow-hidden rounded-md bg-[linear-gradient(145deg,#f9fcff_0%,#edf5fb_100%)] sm:mx-3 sm:mt-3">
				<p className="absolute left-[8%] top-[9%] z-10 text-[0.56rem] font-medium text-[#7a8798] sm:text-[0.68rem] md:text-[0.6rem] lg:text-xs">
					Aktivitas Stasiun
				</p>

				<div className="metric-badge absolute right-[4%] top-[5%] z-20 rounded-xl bg-white/95 px-2.5 py-2 text-[#344256] shadow-[0_8px_24px_rgba(44,75,105,0.17)] backdrop-blur sm:right-[6%] sm:top-[7%] sm:rounded-2xl sm:px-3.5 sm:py-2.5">
					<p className="text-sm font-bold leading-none text-[#152234] sm:text-base md:text-sm lg:text-lg">
						+18%
					</p>
					<p className="mt-1 whitespace-nowrap text-[0.45rem] text-[#8994a4] sm:text-[0.56rem] md:text-[0.48rem] lg:text-[0.62rem]">
						sejak bulan lalu
					</p>
				</div>

				<svg
					viewBox="0 0 270 150"
					role="img"
					aria-label="Grafik aktivitas stasiun meningkat dari Januari hingga Juni"
					className="absolute inset-x-[4%] bottom-[7%] h-[73%] w-[92%] overflow-visible"
				>
					<defs>
						<linearGradient id="trend-bar-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#d6eaff" stopOpacity="0.8" />
							<stop offset="100%" stopColor="#eaf4fd" stopOpacity="0.32" />
						</linearGradient>
					</defs>

					{bars.map((height, index) => (
						<rect
							key={months[index]}
							x={points[index].x - 10}
							y={128 - height}
							width="20"
							height={height}
							rx="2"
							fill="url(#trend-bar-fill)"
							className={visible ? "trend-bar" : "opacity-0"}
							style={{ animationDelay: `${180 + index * 90}ms` }}
						/>
					))}

					<path
						d="M 24 112 C 42 104, 54 96, 68 93 S 98 96, 112 91 S 142 74, 156 70 S 186 63, 200 57 S 230 42, 244 34"
						fill="none"
						stroke="#2384e5"
						strokeWidth="2.5"
						strokeLinecap="round"
						className={visible ? "trend-line" : "opacity-0"}
					/>

					{points.map((point, index) => (
						<g key={months[index]}>
							{index === points.length - 1 && (
								<circle
									cx={point.x}
									cy={point.y}
									r="10"
									fill="#3281d8"
									className={visible ? "trend-final-pulse" : "opacity-0"}
								/>
							)}
							<circle
								cx={point.x}
								cy={point.y}
								r={index === points.length - 1 ? 4.5 : 3.5}
								fill="#2384e5"
								stroke={index === points.length - 1 ? "white" : "none"}
								strokeWidth="2"
								className={visible ? "trend-point" : "opacity-0"}
								style={{ animationDelay: `${520 + index * 130}ms` }}
							/>
							<text
								x={point.x}
								y="145"
								textAnchor="middle"
								className="fill-[#8b96a5] text-[8px]"
							>
								{months[index]}
							</text>
						</g>
					))}
				</svg>
			</div>

			<div className="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
				<h3 className="text-sm font-semibold leading-tight text-[#111827] sm:text-base md:text-sm lg:text-base">
					Trend Dashboard
				</h3>
				<p className="mt-1 max-w-[92%] text-[0.58rem] leading-relaxed text-[#6b7280] sm:text-[0.68rem] md:text-[0.62rem] lg:text-xs">
					Prediksi tren aktivitas stasiun dengan dukungan forecasting
				</p>
			</div>
		</Link>
	);
};

export default TrendDashboardCard;
