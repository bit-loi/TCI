/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/config/supabase", () => ({
	supabase: {
		auth: {
			signUp: vi.fn(),
		},
	},
}));

import Register from "@/pages/Register";
import { supabase } from "@/config/supabase";

function renderRegister() {
	return render(
		<MemoryRouter initialEntries={["/register"]}>
			<Register />
		</MemoryRouter>,
	);
}

describe("Register Page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders register form", () => {
		renderRegister();

		expect(screen.getByText("Buat Akun Baru")).toBeInTheDocument();
		expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password", { exact: true })).toBeInTheDocument();
		expect(screen.getByLabelText("Konfirmasi Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /daftar$/i })).toBeInTheDocument();
	});

	it("renders back to home link", () => {
		renderRegister();

		expect(screen.getByText("Kembali ke Beranda")).toHaveAttribute("href", "/");
	});

	it("renders login link", () => {
		renderRegister();

		expect(screen.getByText("Masuk di sini")).toHaveAttribute("href", "/login");
	});

	it("renders terms and privacy links", () => {
		renderRegister();

		expect(screen.getByText("Syarat & Ketentuan")).toHaveAttribute("href", "/terms");
		expect(screen.getByText("Kebijakan Privasi")).toHaveAttribute(
			"href",
			"/privacy",
		);
	});

	it("updates form inputs", async () => {
		const user = userEvent.setup();
		renderRegister();

		await user.type(screen.getByLabelText("Nama Lengkap"), "John Doe");
		await user.type(screen.getByLabelText("Email"), "john@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.type(screen.getByLabelText("Konfirmasi Password"), "password123");

		expect(screen.getByLabelText("Nama Lengkap")).toHaveValue("John Doe");
		expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
		expect(screen.getByLabelText("Password", { exact: true })).toHaveValue(
			"password123",
		);
		expect(screen.getByLabelText("Konfirmasi Password")).toHaveValue("password123");
	});

	it("shows error when passwords do not match", async () => {
		const user = userEvent.setup();
		renderRegister();

		await user.type(screen.getByLabelText("Nama Lengkap"), "John Doe");
		await user.type(screen.getByLabelText("Email"), "john@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.type(screen.getByLabelText("Konfirmasi Password"), "differentpass");
		await user.click(screen.getByRole("button", { name: /daftar$/i }));

		await waitFor(() => {
			expect(screen.getByText("Password tidak cocok!")).toBeInTheDocument();
		});

		expect(supabase.auth.signUp).not.toHaveBeenCalled();
	});

	it("calls signUp on submit with matching passwords", async () => {
		const user = userEvent.setup();
		(supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
			data: { user: { id: "1" }, session: null },
			error: null,
		});
		renderRegister();

		await user.type(screen.getByLabelText("Nama Lengkap"), "John Doe");
		await user.type(screen.getByLabelText("Email"), "john@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.type(screen.getByLabelText("Konfirmasi Password"), "password123");
		await user.click(screen.getByRole("button", { name: /daftar$/i }));

		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: "john@example.com",
			password: "password123",
			options: {
				data: { full_name: "John Doe" },
			},
		});
	});

	it("shows error on signUp failure", async () => {
		const user = userEvent.setup();
		(supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
			data: { user: null, session: null },
			error: { message: "User already registered" },
		});
		renderRegister();

		await user.type(screen.getByLabelText("Nama Lengkap"), "John Doe");
		await user.type(screen.getByLabelText("Email"), "john@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.type(screen.getByLabelText("Konfirmasi Password"), "password123");
		await user.click(screen.getByRole("button", { name: /daftar$/i }));

		await waitFor(() => {
			expect(screen.getByText("User already registered")).toBeInTheDocument();
		});
	});

	it("toggles password visibility", async () => {
		const user = userEvent.setup();
		renderRegister();

		const toggleButton = screen.getByRole("button", {
			name: /tampilkan password/i,
		});

		expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute(
			"type",
			"password",
		);

		await user.click(toggleButton);
		expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute(
			"type",
			"text",
		);

		await user.click(toggleButton);
		expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute(
			"type",
			"password",
		);
	});

	it("disables submit button while loading", async () => {
		const user = userEvent.setup();
		let resolveSignUp!: (value: unknown) => void;
		(supabase.auth.signUp as ReturnType<typeof vi.fn>).mockReturnValue(
			new Promise((resolve) => {
				resolveSignUp = resolve;
			}),
		);
		renderRegister();

		await user.type(screen.getByLabelText("Nama Lengkap"), "John Doe");
		await user.type(screen.getByLabelText("Email"), "john@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.type(screen.getByLabelText("Konfirmasi Password"), "password123");
		await user.click(screen.getByRole("button", { name: /daftar$/i }));

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /mendaftar\.\.\./i }),
			).toBeDisabled();
		});

		resolveSignUp({ data: { user: null, session: null }, error: null });
	});
});
