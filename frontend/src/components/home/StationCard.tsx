/** @format */

import Cisauk from "@/assets/img/cisauk.jpg";

import CountUp from "../ui/CountUp";

type StationCardProps = {
	visible: boolean;
	embedded?: boolean;
};

const StationCard = ({ visible, embedded = false }: StationCardProps) => {
	return (
		<div
			className={
				embedded
					? "relative"
					: "absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
			}
		>
			<div
				className={`relative w-[min(19rem,calc(100vw-3rem))] rounded-xl border border-slate-300 bg-white p-4 shadow-lg sm:w-85 sm:p-5 ${
					visible ? "animate-card-reveal" : "opacity-0"
				}`}
			>
				{/* Arrow */}
				{!embedded && (
					<div className="absolute -bottom-7.5 left-1/2 h-15 w-15 rounded-br-2xl -translate-x-1/2 rotate-45 border-r border-b border-slate-300 bg-white" />
				)}

				<div className="relative z-10 bg-white">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold text-black">Stasiun Cisauk</h3>

						<span className="rounded-full border border-[#3281d8] bg-[#E9F5FF] px-2 py-0.5 text-xs font-medium text-[#3281d8]">
							#50
						</span>
					</div>

					<p className="mt-2 text-xs font-medium leading-[1.4] text-black">
						Jl. Raya Cisauk Lapan, Sampora, Kec.
						<br />
						Cisauk, Kabupaten Tangerang, Banten
					</p>

					<img
						src={Cisauk}
						alt="Stasiun Cisauk"
						className="mt-3.5 h-36 w-full rounded-md bg-[#d9d9d9] object-cover object-center sm:h-40"
					/>

					<div className="mt-4 flex items-center gap-2 sm:mt-5">
						<div className="flex-1 text-center">
							<p className="text-2xl font-semibold leading-none text-[#3281d8] sm:text-3xl">
								<CountUp end={85} start={visible} />
							</p>
							<p className="text-[10px] text-[#666666]">Skor Stasiun</p>
						</div>

						<div className="h-9 w-px bg-[#cccccc]" />

						<div className="flex-1 text-center">
							<p className="text-2xl font-semibold leading-none text-[#3281d8] sm:text-3xl">
								<CountUp end={2} suffix="%" start={visible} />
							</p>
							<p className="text-[10px] text-[#666666]">Growth Rate</p>
						</div>

						<button
							type="button"
							className="ml-1 rounded-md bg-[#3281d8] px-3 py-2 text-[10px] font-medium whitespace-nowrap text-white shadow-sm transition hover:bg-[#256bb7]"
						>
							Cek Detail
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StationCard;
