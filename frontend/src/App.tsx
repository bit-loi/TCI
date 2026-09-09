/** @format */

import "leaflet/dist/leaflet.css";

import { Navigate, Route, Routes } from "react-router-dom";

import EkonomiKawasan from "./pages/EkonomiKawasan";
import Home from "./pages/Home";
import PropertiTOD from "./pages/PropertiTOD";

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
		</Routes>
	);
}

export default App;
