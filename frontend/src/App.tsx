/** @format */

import "leaflet/dist/leaflet.css";

import { Navigate, Route, Routes } from "react-router-dom";

import EkonomiKawasan from "./pages/EkonomiKawasan";
import Home from "./pages/Home";
import PropertiTOD from "./pages/PropertiTOD";
import StationDetail from "./pages/StationDetail";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />

			<Route
				path="/map"
				element={<Navigate to="/map/ekonomi-kawasan" replace />}
			/>

			<Route path="/map/ekonomi-kawasan" element={<EkonomiKawasan />} />

			<Route path="/map/tod" element={<PropertiTOD />} />

			<Route path="/map/tod/stasiun/:id" element={<StationDetail />} />
		</Routes>
	);
}

export default App;
