/** @format */

import "leaflet/dist/leaflet.css";

import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/hooks/AuthProvider";

import Dashboard from "./pages/Dashboard";
import EkonomiKawasan from "./pages/EkonomiKawasan";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PropertiTOD from "./pages/PropertiTOD";
import Register from "./pages/Register";
import StationDetail from "./pages/StationDetail";

function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="/dashboard" element={<Dashboard />} />

				<Route
					path="/map"
					element={<Navigate to="/map/ekonomi-kawasan" replace />}
				/>

				<Route path="/map/ekonomi-kawasan" element={<EkonomiKawasan />} />

				<Route path="/map/tod" element={<PropertiTOD />} />

				<Route path="/map/tod/stasiun/:id" element={<StationDetail />} />
			</Routes>
		</AuthProvider>
	);
}

export default App;
