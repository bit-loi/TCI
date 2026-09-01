/** @format */

import { useEffect, useState } from "react";

import MapBg from "@/assets/img/home-bg.png";
import { useInView } from "@/hooks/useInView";

import StationCard from "./StationCard";

type Location = {
	id: number;
	x: string;
	y: string;
};

type MapMarkerProps = {
	x: string;
	y: string;
	id: number;
	visible: boolean;
};

const locations: Location[] = [
	{ id: 1, x: "27%", y: "76%" },
	{ id: 2, x: "63%", y: "48%" },
	{ id: 3, x: "76%", y: "72%" },
	{ id: 4, x: "91%", y: "62%" },
];

const MapMarker = ({ x, y, id, visible }: MapMarkerProps) => {
	return (
		<div
			className={`absolute z-10 cursor-pointer group ${visible ? "animate-marker" : "opacity-0"}`}
			style={{
				left: x,
				top: y,
				animationDelay: `${id * 150}ms`,
			}}
		>
			<div className="relative flex h-4 w-4 items-center justify-center">
				{/* Marker Utama (tambahkan hover effect agar lebih interaktif) */}
				<div className="relative h-4 w-4 rounded-full border-2 border-white bg-[#3281d8] shadow-md transition-transform group-hover:scale-125" />
			</div>
		</div>
	);
};

const MapSection = () => {
	const [ref, visible] = useInView({
		threshold: 0.1,
	});

	const [showCard, setShowCard] = useState(false);

	useEffect(() => {
		if (!visible) return;

		const timer = setTimeout(() => {
			setShowCard(true);
		}, 1100);

		return () => clearTimeout(timer);
	}, [visible]);

	return (
		<section
			ref={ref}
			className="relative h-150 w-full overflow-hidden bg-[#e5e7eb]"
		>
			{/* Background map */}
			<img
				src={MapBg}
				alt="Map Background"
				className={`h-full w-full object-cover ${
					visible ? "animate-map-reveal" : "opacity-0"
				}`}
			/>

			{/* White gradient overlay */}
			<div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white via-white/70 to-transparent" />

			{/* Map markers */}
			{locations.map((location) => (
				<MapMarker
					key={location.id}
					id={location.id}
					x={location.x}
					y={location.y}
					visible={visible}
				/>
			))}

			{/* Station card */}
			<StationCard visible={showCard} />
		</section>
	);
};

export default MapSection;
