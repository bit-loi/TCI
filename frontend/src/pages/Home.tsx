/** @format */

import CompareSection from "@/components/home/CompareSection";
import MapSection from "@/components/home/MapSection";
import StatsSection from "@/components/home/StatsSection";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import { useInView } from "@/hooks/useInView";

const HeroContent = () => {
	const [ref, visible] = useInView({
		threshold: 0.2,
	});

	return (
		<section
			ref={ref}
			className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-28 pb-20 text-center sm:pt-36 sm:pb-24 md:pt-45 md:pb-25"
			aria-label="Informasi Transport Connectivity Insight"
		>
			<h1
				className={`m-0 text-3xl font-medium leading-tight text-black sm:text-5xl ${
					visible ? "animate-fade-up" : "opacity-0"
				}`}
			>
				Kota Terus Bergerak.
			</h1>

			<h2
				className={`m-0 mt-2 text-3xl font-medium leading-tight text-black sm:text-5xl ${
					visible ? "animate-fade-up delay-100" : "opacity-0"
				}`}
			>
				Lihat Dimana{" "}
				<span
					className={`bg-gradient rounded px-2 ${
						visible ? "animate-slide-in" : "opacity-0"
					}`}
				>
					Peluang
				</span>{" "}
				Mengikutinya.
			</h2>

			<p
				className={`mt-6 w-full max-w-180 text-base font-medium leading-relaxed text-[#666666] sm:mt-8 sm:text-lg ${
					visible ? "animate-fade-up delay-200" : "opacity-0"
				}`}
			>
				TCI membaca aktivitas di sekitar simpul transportasi dan mengubahnya
				menjadi insight untuk bisnis, pemasaran, dan pengembangan kawasan.
			</p>
		</section>
	);
};

export default function Home() {
	return (
		<div className="relative min-h-screen font-sans">
			<Navbar />

			<main>
				<HeroContent />
				<MapSection />
				<StatsSection />
				<CompareSection />
				<Footer />
			</main>
		</div>
	);
}
