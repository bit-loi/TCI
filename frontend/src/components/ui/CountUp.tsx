/** @format */

import { useEffect, useState } from "react";

export type CountUpProps = {
	end: number;
	duration?: number;
	suffix?: string;
	start: boolean;
};
const CountUp = ({
	end,
	duration = 1000,
	suffix = "",
	start,
}: CountUpProps) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!start) {
			setCount(0);
			return;
		}

		let animationFrame: number;
		const startTime = performance.now();

		const update = (currentTime: number) => {
			const progress = Math.min((currentTime - startTime) / duration, 1);

			const easedProgress = 1 - Math.pow(1 - progress, 3);

			setCount(Math.round(easedProgress * end));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(update);
			}
		};

		animationFrame = requestAnimationFrame(update);

		return () => cancelAnimationFrame(animationFrame);
	}, [start, end, duration]);

	return (
		<>
			{count}
			{suffix}
		</>
	);
};

export default CountUp;
