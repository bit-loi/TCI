/** @format */

import { useEffect, useState } from "react";

import MapBg from "@/assets/img/home-bg.png";
import { useInView } from "@/hooks/useInView";

import StationCard from "./StationCard";

type MapMarkerProps = {
	x: string;
	y: string;
	visible: boolean;
};

const MapMarker = ({ x, y, visible }: MapMarkerProps) => (
	<div
		className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${
			visible ? "animate-marker" : "opacity-0"
		}`}
		style={{ left: x, top: y }}
	>
		<div className="landing-static-pin h-4 w-4 rounded-full border-2 border-white bg-[#3281d8]" />
	</div>
);

const MapSection = () => {
	const [ref, visible] = useInView({
		threshold: 0.1,
	});
	const [showCard, setShowCard] = useState(false);

	useEffect(() => {
		if (!visible) return;

		const timer = window.setTimeout(() => setShowCard(true), 700);
		return () => window.clearTimeout(timer);
	}, [visible]);

	return (
		<section
			ref={ref}
			className="relative h-[32rem] w-full overflow-hidden bg-[#e5e7eb] sm:h-150"
		>
			<img
				src={MapBg}
				alt="Pratinjau peta Stasiun Cisauk"
				className={`h-full w-full object-cover ${
					visible ? "animate-map-reveal" : "opacity-0"
				}`}
			/>

			{/* White gradient overlay */}
			<div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white via-white/70 to-transparent" />

			<MapMarker x="50%" y="86%" visible={visible} />
			<StationCard visible={showCard} />

		</section>
	);
};

export default MapSection;
