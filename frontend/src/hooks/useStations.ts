// ponytail: minimal fetch hook, caches stations in module scope
import { useState, useEffect } from "react";

let cache: StationML[] | null = null;

export type StationML = {
  id: string;
  name: string;
  coord: [number, number];
  lines: string[];
  score: number;
  rank: number;
  typology: { clusterId: number; label: string };
  growth: { historical_yoy_pct: number; forecast_3m_pct: number };
  data_status: string;
};

// ponytail: Station alias for frontend compatibility
export type Station = StationML;

export type StationDetail = StationML & {
  forecast: { period: string; predicted_passengers: number }[];
  recommendation: { category: string; confidence: number; bufferRadiusSuggestion: number };
};

export type StationForecast = {
  historical: { period: string; passengers: number }[];
  forecast: { period: string; predicted_passengers: number }[];
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useStations() {
  const [stations, setStations] = useState<StationML[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cache) { setStations(cache); setLoading(false); return; }
    fetch(`${API}/api/stations`)
      .then(r => r.json())
      .then(j => { cache = j.data; setStations(j.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return { stations, loading, error };
}

export function useStationDetail(id: string) {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [insight, setInsight] = useState<{ text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/stations/${id}`).then(r => r.json()),
      fetch(`${API}/api/stations/${id}/insight`).then(r => r.json()),
    ]).then(([st, ins]) => {
      setStation(st.data);
      setInsight(ins.data);
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  return { station, insight, loading, error };
}

export function useStationForecast(id: string) {
  const [data, setData] = useState<StationForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/api/stations/${id}/forecast`)
      .then(r => r.json())
      .then(j => { setData(j.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  return { data, loading, error };
}
