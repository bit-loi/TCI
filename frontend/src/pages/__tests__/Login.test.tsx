/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockApiFetch = vi.fn();
const mockSetTokens = vi.fn();

vi.mock("@/config/api", () => ({
	apiFetch: (...args: unknown[]) => mockApiFetch(...args),
	setTokens: (...args: unknown[]) => mockSetTokens(...args),
	clearTokens: vi.fn(),
	getRefreshToken: vi.fn(),
}));

import Login from "@/pages/Login";

function renderLogin() {
	return render(
		<MemoryRouter initialEntries={["/login"]}>
			<Login />
		</MemoryRouter>,
	);
}

describe("Login Page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders login form", () => {
		renderLogin();

		expect(screen.getByText("Masuk ke Akun Anda")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password", { exact: true })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /masuk$/i })).toBeInTheDocument();
	});

	it("renders back to home link", () => {
		renderLogin();

		expect(screen.getByText("Kembali ke Beranda")).toHaveAttribute("href", "/");
	});

	it("renders register link", () => {
		renderLogin();

		expect(screen.getByText("Daftar sekarang")).toHaveAttribute("href", "/register");
	});

	it("renders forgot password link", () => {
		renderLogin();

		expect(screen.getByText("Lupa password?")).toHaveAttribute(
			"href",
			"/forgot-password",
		);
	});

	it("updates email input", async () => {
		const user = userEvent.setup();
		renderLogin();

		const emailInput = screen.getByLabelText("Email");
		await user.type(emailInput, "test@example.com");

		expect(emailInput).toHaveValue("test@example.com");
	});

	it("updates password input", async () => {
		const user = userEvent.setup();
		renderLogin();

		const passwordInput = screen.getByLabelText("Password", { exact: true });
		await user.type(passwordInput, "password123");

		expect(passwordInput).toHaveValue("password123");
	});

	it("toggles password visibility", async () => {
		const user = userEvent.setup();
		renderLogin();

		const toggleButton = screen.getByRole("button", {
			name: /tampilkan password/i,
		});
		const passwordInput = screen.getByLabelText("Password", { exact: true });

		expect(passwordInput).toHaveAttribute("type", "password");

		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "text");

		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "password");
	});

	it("calls apiFetch on submit", async () => {
		const user = userEvent.setup();
		mockApiFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					user: { id: "1", email: "test@example.com" },
					session: { access_token: "at", refresh_token: "rt", expires_in: 3600, expires_at: 999 },
				}),
		});
		renderLogin();

		await user.type(screen.getByLabelText("Email"), "test@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.click(screen.getByRole("button", { name: /masuk$/i }));

		expect(mockApiFetch).toHaveBeenCalledWith("/api/auth/signin", {
			method: "POST",
			body: JSON.stringify({ email: "test@example.com", password: "password123" }),
		});
	});

	it("shows error message on login failure", async () => {
		const user = userEvent.setup();
		mockApiFetch.mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({ error: "Email atau password salah" }),
		});
		renderLogin();

		await user.type(screen.getByLabelText("Email"), "wrong@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "wrongpass");
		await user.click(screen.getByRole("button", { name: /masuk$/i }));

		await waitFor(() => {
			expect(screen.getByText("Email atau password salah")).toBeInTheDocument();
		});
	});

	it("shows generic error for network errors", async () => {
		const user = userEvent.setup();
		mockApiFetch.mockRejectedValue(new Error("Network error"));
		renderLogin();

		await user.type(screen.getByLabelText("Email"), "test@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.click(screen.getByRole("button", { name: /masuk$/i }));

		await waitFor(() => {
			expect(screen.getByText("Gagal terhubung ke server")).toBeInTheDocument();
		});
	});

	it("disables submit button while loading", async () => {
		const user = userEvent.setup();
		let resolveFetch!: (value: unknown) => void;
		mockApiFetch.mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve;
			}),
		);
		renderLogin();

		await user.type(screen.getByLabelText("Email"), "test@example.com");
		await user.type(screen.getByLabelText("Password", { exact: true }), "password123");
		await user.click(screen.getByRole("button", { name: /masuk$/i }));

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /masuk\.\.\./i })).toBeDisabled();
		});

		resolveFetch({
			ok: true,
			json: () => Promise.resolve({ session: { access_token: "at", refresh_token: "rt" } }),
		});
	});
});
