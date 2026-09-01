/** @format */

import { useInView } from "@/hooks/useInView";

import CountUp from "../ui/CountUp";

type StatItem = {
	id: number;
	value: string;
	suffix?: string;
	labelTop: string;
	labelBottom?: string;
	isPrimary?: boolean;
};

const statsData: StatItem[] = [
	{
		id: 1,
		value: "100",
		suffix: "+",
		labelTop: "Data",
		labelBottom: "Stasiun",
		isPrimary: true,
	},
	{
		id: 2,
		value: "132",
		labelTop: "Pengguna",
		labelBottom: "Terdaftar",
	},
	{
		id: 3,
		value: "5.000",
		labelTop: "Usaha",
	},
	{
		id: 4,
		value: "56",
		labelTop: "Properti",
		labelBottom: "Tersimpan",
	},
];

const StatsSection = () => {
	const [ref, visible] = useInView({
		threshold: 0.5,
	});

	return (
		<section
			ref={ref}
			className="border-y border-blue-200 bg-white py-8 sm:py-10"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 sm:gap-y-10 md:flex md:items-center md:justify-between md:px-20">
				{statsData.map((stat) => (
					<div
						key={stat.id}
						className={`flex items-center justify-center gap-2 sm:gap-3 md:justify-start ${
							visible ? "animate-fade-up" : "opacity-0"
						}`}
					>
						{/* Nilai / Angka */}
						<div className="text-[32px] font-medium leading-none text-black sm:text-[40px]">
							<CountUp
								end={Number(stat.value.replace(".", ""))}
								start={visible}
							/>
							{stat?.suffix}
						</div>

						{/* Label */}
						<div
							className={`text-lg font-medium leading-[1.1] sm:text-2xl ${
								stat.isPrimary ? "text-[#49B5C6]" : "text-[#999999]"
							}`}
						>
							{stat.labelTop}
							{stat.labelBottom && (
								<>
									<br />
									{stat.labelBottom}
								</>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default StatsSection;
