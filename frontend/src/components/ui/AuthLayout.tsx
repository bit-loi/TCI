/** @format */

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<main className="relative isolate flex min-h-dvh w-full min-w-0 items-center justify-center bg-[#f0f6ff] px-4 py-6 sm:py-12">
			{/* Clip only the decoration so it cannot enlarge the page's scroll area. */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 overflow-hidden"
			>
				<div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#60d2cd]/10 blur-3xl" />
				<div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#3281d8]/10 blur-3xl" />
			</div>

			{children}
		</main>
	);
}
