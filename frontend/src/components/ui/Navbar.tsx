/** @format */

import { useState } from "react";

import { Link, NavLink } from "react-router-dom";

import LogoNav from "@/assets/logo/logo-nav.png";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
	label: string;
	path: string;
};

const navItems: NavItem[] = [
	{ label: "Beranda", path: "/" },
	{ label: "Peta", path: "/map" },
	{ label: "Dashboard", path: "/dashboard" },
];

const Navbar = () => {
	const { session } = useAuth();

	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="fixed left-0 top-0 z-50 w-full">
			{/* Container */}
			<div className="container mx-auto w-full max-w-7xl rounded-b-[9px] border-b border-[#2f7ed6] bg-white">
				<div className="relative flex h-16 items-center px-4 sm:h-20 sm:px-8 md:px-20">
					{/* Logo */}
					<Link
						to="/"
						className="w-16 sm:w-20"
						aria-label="TCI, return to home"
					>
						<img className="w-full object-cover" src={LogoNav} alt="Logo TCI" />
					</Link>

					{/* Desktop Navigation */}
					<nav
						className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex"
						aria-label="Navigasi utama"
					>
						{navItems.map((item) => (
							<NavLink
								key={item.label}
								to={item.path}
								end={item.path === "/"}
								className={({ isActive }) =>
									isActive
										? "color-gradient font-semibold"
										: "text-[#868686] transition-colors hover:text-[#3281d8]"
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>

					{/* Desktop Auth */}
					<div className="ml-auto hidden items-center gap-2.5 md:flex">
						{session && (
							<Link
								to="/dashboard"
								className="flex h-8 px-6 items-center justify-center rounded-full bg-gradient text-[#868686] transition-colors hover:bg-[#2f7ed6] hover:text-white"
							>
								Dashboard
							</Link>
						)}
						{!session && (
							<>
								<Link
									to="/register"
									className="flex h-8 w-23 items-center justify-center rounded-full border border-[#2f7ed6] text-[#868686] transition-colors hover:bg-[#2f7ed6] hover:text-white"
								>
									Daftar
								</Link>

								<Link
									to="/login"
									className="bg-gradient button-animation flex h-8 w-23 items-center justify-center rounded-full"
								>
									Login
								</Link>
							</>
						)}
					</div>

					{/* Mobile Burger */}
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-[#2f7ed6] md:hidden"
						aria-label={isOpen ? "Tutup menu" : "Buka menu"}
						aria-expanded={isOpen}
					>
						<span className="flex flex-col gap-1.5">
							<span className="block h-0.5 w-6 bg-current" />
							<span className="block h-0.5 w-6 bg-current" />
							<span className="block h-0.5 w-6 bg-current" />
						</span>
					</button>
				</div>

				{/* Mobile Menu */}
				<div
					className={`overflow-hidden transition-[max-height,opacity] duration-300 md:hidden ${
						isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
					}`}
				>
					<div className="flex flex-col gap-6 border-t border-[#eeeeee] px-4 py-6">
						{/* Navigation */}
						<nav className="flex flex-col gap-5" aria-label="Navigasi mobile">
							{navItems.map((item) => (
								<NavLink
									key={item.label}
									to={item.path}
									end={item.path === "/"}
									onClick={() => setIsOpen(false)}
									className={({ isActive }) =>
										isActive
											? "color-gradient font-semibold"
											: "text-[#868686] transition-colors hover:text-[#3281d8]"
									}
								>
									{item.label}
								</NavLink>
							))}
						</nav>

						{/* Auth */}
						<div className="flex flex-col gap-3 border-t border-[#eeeeee] pt-5">
							<Link
								to="/register"
								onClick={() => setIsOpen(false)}
								className="flex h-10 w-full items-center justify-center rounded-full border border-[#2f7ed6] text-[#868686] transition-colors hover:bg-[#2f7ed6] hover:text-white"
							>
								Daftar
							</Link>

							<Link
								to="/login"
								onClick={() => setIsOpen(false)}
								className="bg-gradient button-animation flex h-10 w-full items-center justify-center rounded-full"
							>
								Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
