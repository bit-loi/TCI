/** @format */

import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useInView } from "@/hooks/useInView";

import AIInsightCard from "./AIInsightCard";
import HotspotFinderCard from "./HotspotFinderCard";
import TrendDashboardCard from "./TrendDashboardCard";

const CompareSection = () => {
	const options = useMemo(
		() => ({
			threshold: 0.5,
		}),
		[],
	);

	const [ref, visible] = useInView(options);

	return (
		<section
			ref={ref}
			className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 px-4 py-14 sm:gap-12 sm:py-16 md:flex-row md:px-20 md:py-24"
		>
			<div className="flex w-full flex-col items-start justify-center text-left md:w-1/2">
				<p
					className={`text-sm font-medium text-[#3b87d6] sm:text-base ${
						visible ? "animate-fade-up" : "opacity-0"
					}`}
				>
					Mapid WebGIS Hackathon
				</p>

				<h2
					className={`mt-3 text-3xl font-semibold leading-tight text-black sm:text-4xl md:text-[2.75rem] ${
						visible ? "animate-slide-in-text delay-200" : "opacity-0"
					}`}
				>
					Bandingkan Potensi Lokasi dengan Data Asli Lebih Akurat
				</h2>

				<p
					className={`mt-5 max-w-md text-sm leading-relaxed text-[#666666] sm:mt-6 sm:text-base md:text-lg ${
						visible ? "animate-slide-in-text delay-200" : "opacity-0"
					}`}
				>
					Ubah data aktivitas di sekitar stasiun menjadi insight yang lebih
					bermakna untuk menemukan lokasi dengan potensi ekonomi dan pengembangan
					terbaik.
				</p>

				<Link
					to="/map/ekonomi-kawasan"
					className={`button-animation mt-7 rounded-md bg-gradient px-7 py-3 text-sm font-medium text-white shadow-[0_4px_14px_0_rgba(59,135,214,0.39)] sm:mt-8 sm:px-8 sm:py-3.5 sm:text-base ${
						visible ? "animate-fade-up delay-200" : "opacity-0"
					}`}
				>
					Jelajahi Peta
				</Link>
			</div>

			<div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:w-1/2 md:gap-6">
				<HotspotFinderCard visible={visible} />

				<TrendDashboardCard visible={visible} />

				<AIInsightCard visible={visible} />
			</div>
		</section>
	);
};

export default CompareSection;
