/** @format */

import { useEffect, useRef, useState } from "react";

export const useInView = (options: IntersectionObserverInit = {}) => {
	const ref = useRef<HTMLElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const element = ref.current;

		if (!element || visible) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.unobserve(element);
				}
			},
			{
				threshold: 0.5,
				...options,
			},
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [options, visible]);

	return [ref, visible] as const;
};
