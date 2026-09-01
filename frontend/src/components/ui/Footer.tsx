/** @format */

import { useInView } from "@/hooks/useInView";

const FooterSection = () => {
	const [ref, visible] = useInView({ threshold: 0.5 });

	return (
		<footer ref={ref} className="relative w-full overflow-hidden">
			{/* Latar Belakang Biru di Bagian Bawah */}
			<div className="absolute bottom-0 left-0 -z-10 h-[60%] w-full bg-[#dbe4f7]"></div>

			<div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-16 pb-4 sm:px-6 sm:pt-20 md:px-0 md:pt-24">
				{/* Kartu Berlangganan */}
				<div
					className={`mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-8 rounded-3xl bg-white p-7 shadow-[0_20px_50px_#D3DEF5] sm:p-10 md:flex-row md:p-14 ${
						visible ? "animate-card-reveal" : "opacity-0"
					}`}
				>
					{/* Sisi Kiri: Teks */}
					<div className="w-full text-left md:w-1/2">
						<h2
							className={`text-3xl font-semibold text-black sm:text-4xl md:text-5xl ${
								visible ? "animate-slide-in" : "invisible"
							}`}
						>
							Get Fastest Updates
						</h2>

						<p
							className={`mt-4 text-base text-[#555555] sm:text-lg ${
								visible ? "animate-fade-up delay-100" : "opacity-0"
							}`}
						>
							Lorem ipsum dolor sit amet, <br className="hidden sm:block" />
							tempor minim enim ad in ea.
						</p>
					</div>

					{/* Sisi Kanan: Input Form */}
					<div
						className={`flex w-full flex-col gap-3 sm:flex-row md:w-1/2 md:justify-end ${
							visible ? "animate-fade-up delay-200" : "opacity-0"
						}`}
					>
						<input
							type="email"
							placeholder="Email Anda"
							className="w-full rounded border border-[#3b87d6] px-5 py-3.5 text-base text-gray-700 outline-none focus:ring-1 focus:ring-[#3b87d6] sm:w-2/3"
						/>

						<button className="whitespace-nowrap rounded bg-[#3b87d6] px-8 py-3.5 text-base font-medium text-white button-animation sm:w-1/3">
							Subscribe
						</button>
					</div>
				</div>

				{/* Teks Footer Bawah */}
				<div
					className={`mx-auto mt-12 flex max-w-full flex-col items-center justify-between gap-6 px-4 sm:mt-20 sm:px-6 md:flex-row md:px-20 ${
						visible ? "animate-fade-up delay-200" : "opacity-0"
					}`}
				>
					{/* Info Kontak */}
					<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-10 sm:text-left">
						<a
							href="mailto:support.contact@tci.id"
							className="text-base font-medium text-black transition-colors hover:text-[#3b87d6]"
						>
							support.contact@tci.id
						</a>

						<a
							href="tel:+62813885409143"
							className="text-base font-medium text-black transition-colors hover:text-[#3b87d6]"
						>
							(+62) 8138 8540 9143
						</a>
					</div>

					<div className="text-center text-base font-medium text-[#657694]">
						TCI, A Map That Thinks
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterSection;
