/** @format */

import "leaflet/dist/leaflet.css";

import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { AuthProvider } from "@/hooks/AuthProvider";

import Dashboard from "./pages/Dashboard";
import EkonomiKawasan from "./pages/EkonomiKawasan";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import PropertiTOD from "./pages/PropertiTOD";
import Register from "./pages/Register";
import StationDetail from "./pages/StationDetail";
import Terms from "./pages/Terms";

function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />

				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/map"
					element={
						<ProtectedRoute>
							<Navigate to="/map/ekonomi-kawasan" replace />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/map/ekonomi-kawasan"
					element={
						<ProtectedRoute>
							<EkonomiKawasan />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/map/tod"
					element={
						<ProtectedRoute>
							<PropertiTOD />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/map/tod/stasiun/:id"
					element={
						<ProtectedRoute>
							<StationDetail />
						</ProtectedRoute>
					}
				/>

				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />

				{/* Catch-all: any unknown URL gets the 404 page. */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</AuthProvider>
	);
}

export default App;
