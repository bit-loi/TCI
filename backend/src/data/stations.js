// ponytail: synthetic prototype data, derived from KRL_STATIONS + deterministic rules
// seed = 20260911 for reproducibility

const STATIONS = [
  { id: "jakartakota", name: "Jakarta Kota", coord: [-6.1376, 106.8136], lines: ["Bogor", "Tanjung Priok"] },
  { id: "jayakarta", name: "Jayakarta", coord: [-6.1437, 106.8175], lines: ["Bogor"] },
  { id: "manggabesar", name: "Mangga Besar", coord: [-6.149, 106.8232], lines: ["Bogor"] },
  { id: "sawahbesar", name: "Sawah Besar", coord: [-6.1606, 106.8294], lines: ["Bogor"] },
  { id: "juanda", name: "Juanda", coord: [-6.1666, 106.8307], lines: ["Bogor"] },
  { id: "gondangdia", name: "Gondangdia", coord: [-6.1862, 106.832], lines: ["Bogor"] },
  { id: "cikini", name: "Cikini", coord: [-6.1985, 106.841], lines: ["Bogor"] },
  { id: "manggarai", name: "Manggarai", coord: [-6.2098, 106.8503], lines: ["Bogor", "Cikarang"] },
  { id: "tebet", name: "Tebet", coord: [-6.2261, 106.858], lines: ["Bogor"] },
  { id: "cawang", name: "Cawang", coord: [-6.2426, 106.8623], lines: ["Bogor"] },
  { id: "durenkalibata", name: "Duren Kalibata", coord: [-6.2562, 106.8556], lines: ["Bogor"] },
  { id: "pasarminggubaru", name: "Pasar Minggu Baru", coord: [-6.2641, 106.85], lines: ["Bogor"] },
  { id: "pasarminggu", name: "Pasar Minggu", coord: [-6.284, 106.8442], lines: ["Bogor"] },
  { id: "tanjungbarat", name: "Tanjung Barat", coord: [-6.3072, 106.8345], lines: ["Bogor"] },
  { id: "lentengagung", name: "Lenteng Agung", coord: [-6.3318, 106.8345], lines: ["Bogor"] },
  { id: "univpancasila", name: "Universitas Pancasila", coord: [-6.338, 106.8344], lines: ["Bogor"] },
  { id: "univindonesia", name: "Universitas Indonesia", coord: [-6.3608, 106.8318], lines: ["Bogor"] },
  { id: "pondokcina", name: "Pondok Cina", coord: [-6.369, 106.8324], lines: ["Bogor"] },
  { id: "depokbaru", name: "Depok Baru", coord: [-6.3914, 106.8221], lines: ["Bogor"] },
  { id: "depok", name: "Depok", coord: [-6.4002, 106.819], lines: ["Bogor"] },
  { id: "citayam", name: "Citayam", coord: [-6.447, 106.809], lines: ["Bogor", "Nambo"] },
  { id: "bojonggede", name: "Bojonggede", coord: [-6.479, 106.796], lines: ["Bogor"] },
  { id: "cilebut", name: "Cilebut", coord: [-6.5295, 106.7935], lines: ["Bogor"] },
  { id: "bogor", name: "Bogor", coord: [-6.5556, 106.7905], lines: ["Bogor"] },
  { id: "pondokrajeg", name: "Pondok Rajeg", coord: [-6.4665, 106.832], lines: ["Nambo"] },
  { id: "cibinong", name: "Cibinong", coord: [-6.4838, 106.854], lines: ["Nambo"] },
  { id: "nambo", name: "Nambo", coord: [-6.4905, 106.8865], lines: ["Nambo"] },
  { id: "cikarang", name: "Cikarang", coord: [-6.2566, 107.152], lines: ["Cikarang"] },
  { id: "telagamurni", name: "Telaga Murni", coord: [-6.262, 107.11], lines: ["Cikarang"] },
  { id: "cibitung", name: "Cibitung", coord: [-6.264, 107.086], lines: ["Cikarang"] },
  { id: "tambun", name: "Tambun", coord: [-6.2618, 107.053], lines: ["Cikarang"] },
  { id: "bekasitimur", name: "Bekasi Timur", coord: [-6.251, 107.006], lines: ["Cikarang"] },
  { id: "bekasi", name: "Bekasi", coord: [-6.2355, 106.999], lines: ["Cikarang"] },
  { id: "kranji", name: "Kranji", coord: [-6.224, 106.968], lines: ["Cikarang"] },
  { id: "cakung", name: "Cakung", coord: [-6.215, 106.943], lines: ["Cikarang"] },
  { id: "klenderbaru", name: "Klender Baru", coord: [-6.22, 106.93], lines: ["Cikarang"] },
  { id: "buaran", name: "Buaran", coord: [-6.222, 106.923], lines: ["Cikarang"] },
  { id: "klender", name: "Klender", coord: [-6.216, 106.899], lines: ["Cikarang"] },
  { id: "jatinegara", name: "Jatinegara", coord: [-6.215, 106.8705], lines: ["Cikarang"] },
  { id: "matraman", name: "Matraman", coord: [-6.2016, 106.8556], lines: ["Cikarang"] },
  { id: "sudirman", name: "Sudirman", coord: [-6.2014, 106.8232], lines: ["Cikarang"] },
  { id: "sudirmanbaru", name: "Sudirman Baru", coord: [-6.2008, 106.8205], lines: ["Cikarang"] },
  { id: "karet", name: "Karet", coord: [-6.197, 106.817], lines: ["Cikarang"] },
  { id: "tanahabang", name: "Tanah Abang", coord: [-6.1862, 106.8108], lines: ["Cikarang", "Rangkasbitung"] },
  { id: "duri", name: "Duri", coord: [-6.17, 106.793], lines: ["Cikarang", "Tangerang"] },
  { id: "angke", name: "Angke", coord: [-6.1455, 106.796], lines: ["Cikarang"] },
  { id: "kampungbandan", name: "Kampung Bandan", coord: [-6.137, 106.817], lines: ["Cikarang", "Tanjung Priok"] },
  { id: "pondokjati", name: "Pondok Jati", coord: [-6.2076, 106.8642], lines: ["Cikarang"] },
  { id: "kramat", name: "Kramat", coord: [-6.1898, 106.8545], lines: ["Cikarang"] },
  { id: "gangsentiong", name: "Gang Sentiong", coord: [-6.1817, 106.8489], lines: ["Cikarang"] },
  { id: "pasarsenen", name: "Pasar Senen", coord: [-6.1745, 106.844], lines: ["Cikarang"] },
  { id: "kemayoran", name: "Kemayoran", coord: [-6.1626, 106.8508], lines: ["Cikarang"] },
  { id: "rajawali", name: "Rajawali", coord: [-6.1437, 106.8327], lines: ["Cikarang"] },
  { id: "palmerah", name: "Palmerah", coord: [-6.208, 106.7975], lines: ["Rangkasbitung"] },
  { id: "kebayoran", name: "Kebayoran", coord: [-6.239, 106.7835], lines: ["Rangkasbitung"] },
  { id: "pondokranji", name: "Pondok Ranji", coord: [-6.2755, 106.747], lines: ["Rangkasbitung"] },
  { id: "jurangmangu", name: "Jurang Mangu", coord: [-6.284, 106.735], lines: ["Rangkasbitung"] },
  { id: "sudimara", name: "Sudimara", coord: [-6.2895, 106.722], lines: ["Rangkasbitung"] },
  { id: "rawabuntu", name: "Rawa Buntu", coord: [-6.3145, 106.671], lines: ["Rangkasbitung"] },
  { id: "serpong", name: "Serpong", coord: [-6.317, 106.662], lines: ["Rangkasbitung"] },
  { id: "cisauk", name: "Cisauk", coord: [-6.326, 106.641], lines: ["Rangkasbitung"] },
  { id: "cicayur", name: "Cicayur", coord: [-6.332, 106.617], lines: ["Rangkasbitung"] },
  { id: "parungpanjang", name: "Parung Panjang", coord: [-6.345, 106.579], lines: ["Rangkasbitung"] },
  { id: "cilejit", name: "Cilejit", coord: [-6.356, 106.545], lines: ["Rangkasbitung"] },
  { id: "daru", name: "Daru", coord: [-6.362, 106.518], lines: ["Rangkasbitung"] },
  { id: "tenjo", name: "Tenjo", coord: [-6.334, 106.464], lines: ["Rangkasbitung"] },
  { id: "tigaraksa", name: "Tigaraksa", coord: [-6.358, 106.464], lines: ["Rangkasbitung"] },
  { id: "cikoya", name: "Cikoya", coord: [-6.365, 106.45], lines: ["Rangkasbitung"] },
  { id: "maja", name: "Maja", coord: [-6.366, 106.429], lines: ["Rangkasbitung"] },
  { id: "citeras", name: "Citeras", coord: [-6.37, 106.37], lines: ["Rangkasbitung"] },
  { id: "rangkasbitung", name: "Rangkasbitung", coord: [-6.365, 106.253], lines: ["Rangkasbitung"] },
  { id: "jatake", name: "Jatake", coord: [-6.3385, 106.5975], lines: ["Rangkasbitung"] },
  { id: "grogol", name: "Grogol", coord: [-6.165, 106.789], lines: ["Tangerang"] },
  { id: "pesing", name: "Pesing", coord: [-6.162, 106.766], lines: ["Tangerang"] },
  { id: "tamankota", name: "Taman Kota", coord: [-6.16, 106.753], lines: ["Tangerang"] },
  { id: "bojongindah", name: "Bojong Indah", coord: [-6.161, 106.734], lines: ["Tangerang"] },
  { id: "rawabuaya", name: "Rawa Buaya", coord: [-6.161, 106.72], lines: ["Tangerang"] },
  { id: "kalideres", name: "Kalideres", coord: [-6.161, 106.703], lines: ["Tangerang"] },
  { id: "poris", name: "Poris", coord: [-6.173, 106.672], lines: ["Tangerang"] },
  { id: "batuceper", name: "Batu Ceper", coord: [-6.184, 106.647], lines: ["Tangerang"] },
  { id: "tanahtinggi", name: "Tanah Tinggi", coord: [-6.186, 106.636], lines: ["Tangerang"] },
  { id: "tangerang", name: "Tangerang", coord: [-6.192, 106.628], lines: ["Tangerang"] },
  { id: "ancol", name: "Ancol", coord: [-6.127, 106.833], lines: ["Tanjung Priok"] },
  { id: "tanjungpriok", name: "Tanjung Priok", coord: [-6.105, 106.88], lines: ["Tanjung Priok"] },
];

// ponytail: seeded LCG RNG, seed 20260911
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rng = makeRng(20260911);

// ponytail: compute centroid of all stations for centrality
function centroid(stations) {
  const n = stations.length;
  const lat = stations.reduce((s, st) => s + st.coord[0], 0) / n;
  const lng = stations.reduce((s, st) => s + st.coord[1], 0) / n;
  return [lat, lng];
}
const CENTER = centroid(STATIONS);

function distToCenter(station) {
  const [lat, lng] = station.coord;
  return Math.sqrt((lat - CENTER[0]) ** 2 + (lng - CENTER[1]) ** 2);
}
const maxDist = Math.max(...STATIONS.map(distToCenter));

// ponytail: deterministic features per station
const FEATURES = {};
for (const st of STATIONS) {
  const connectivity = st.lines.length;
  const isHub = connectivity >= 2;
  const centrality = 1 - distToCenter(st) / maxDist;
  const passengerBase = 50000 + Math.floor(rng() * 150000);
  const growthRate = 0.01 + rng() * 0.11;
  const businessDensity = 10 + Math.floor(120 * centrality + 35 * connectivity + rng() * 20);
  const propertyAvail = 0.3 + rng() * 0.5;
  const intermodal = Math.min(1, 0.2 + 0.4 * (isHub ? 1 : 0) + 0.2 * (connectivity - 1) / 3);

  FEATURES[st.id] = {
    connectivity,
    isHub,
    centrality,
    passengerBase,
    growthRate,
    businessDensity,
    propertyAvail,
    intermodal,
  };
}

// ponytail: assign cluster via simple rules (no TF.js needed for kmeans when k=4 with clear thresholds)
function assignCluster(features) {
  if (features.isHub && features.centrality > 0.6) return 0;       // Hub Aktivitas Tinggi
  if (features.connectivity >= 3) return 1;                         // Koridor Komuter Utama
  if (features.isHub || features.centrality > 0.4) return 2;       // Stasiun Transisi
  return 3;                                                          // Aktivitas Lokal
}
const CLUSTER_LABELS = ["Hub Aktivitas Tinggi", "Koridor Komuter Utama", "Stasiun Transisi", "Aktivitas Lokal"];

// ponytail: scoring formula mirrors Python generator weights
function computeScore(features) {
  const { centrality, connectivity, isHub, businessDensity, propertyAvail, intermodal, growthRate, passengerBase } = features;
  const passengerNorm = passengerBase / 200000;
  const growthNorm = growthRate / 0.12;
  const pedestrian = Math.min(1, 0.4 + 0.4 * centrality + 0.2 * (isHub ? 1 : 0));
  const score = (
    0.26 * passengerNorm +
    0.12 * growthNorm +
    0.17 * pedestrian +
    0.14 * Math.min(businessDensity / 175, 1) +
    0.15 * propertyAvail +
    0.16 * intermodal
  ) * 100;
  return Math.max(8, Math.min(97, score));
}

const scored = STATIONS.map(st => {
  const f = FEATURES[st.id];
  const score = +computeScore(f).toFixed(1);
  const clusterId = assignCluster(f);
  const yoyPct = f.growthRate * 100;
  return { ...st, score, clusterId, yoyPct, features: f };
}).sort((a, b) => b.score - a.score);

scored.forEach((st, i) => { st.rank = i + 1; });

// ponytail: stable time series: base monthly volume * seasonal factor, no compounding explosion
function genTimeSeries(passengerBase, growthRate) {
  const rows = [];
  const base = passengerBase * 30; // approximate monthly from daily
  const monthlyGrowth = growthRate / 12;
  for (let t = 0; t < 36; t++) {
    const year = 2023 + Math.floor(t / 12);
    const month = (t % 12) + 1;
    const season = 1 + 0.12 * Math.sin((month - 3) * Math.PI / 6);
    const trend = 1 + monthlyGrowth * t;
    const vol = base * trend * season * (0.97 + rng() * 0.06);
    rows.push({ period: `${year}-${String(month).padStart(2, "0")}`, passengers: Math.round(vol) });
  }
  return rows;
}

// ponytail: simple 3-month forecast using last value + small growth assumption
function forecast3(historical) {
  const last = historical[historical.length - 1];
  const prev = historical[historical.length - 3];
  const monthlyGrowth = (last.passengers - prev.passengers) / prev.passengers / 2;
  const [y, m] = last.period.split("-").map(Number);
  const forecasts = [];
  let curr = last.passengers;
  for (let i = 1; i <= 3; i++) {
    let mm = m + i, yy = y;
    while (mm > 12) { mm -= 12; yy++; }
    const p = `${yy}-${String(mm).padStart(2, "0")}`;
    curr = curr * (1 + Math.max(-0.05, Math.min(0.15, monthlyGrowth)));
    forecasts.push({ period: p, predicted_passengers: Math.round(curr) });
  }
  return forecasts;
}

// ponytail: rule-based business category
function classify(features, clusterId) {
  const categories = ["Makanan", "Minuman", "Toko Buku", "Hobi", "Lainnya"];
  if (clusterId === 0) return { category: "Makanan", confidence: 0.72 };
  if (clusterId === 1) return { category: "Minuman", confidence: 0.68 };
  if (clusterId === 2) return { category: "Toko Buku", confidence: 0.65 };
  if (clusterId === 3) return { category: "Hobi", confidence: 0.61 };
  return { category: "Lainnya", confidence: 0.55 };
}

const STATION_DATA = {};
for (const st of scored) {
  const ts = genTimeSeries(st.features.passengerBase, st.features.growthRate);
  const fc = forecast3(ts);
  const cls = classify(st.features, st.clusterId);
  STATION_DATA[st.id] = {
    ...st,
    typology: { clusterId: st.clusterId, label: CLUSTER_LABELS[st.clusterId] },
    growth: { historical_yoy_pct: parseFloat(st.yoyPct.toFixed(2)), forecast_3m_pct: parseFloat((((fc[2].predicted_passengers / ts[ts.length - 1].passengers) - 1) * 100).toFixed(2)) },
    timeSeries: ts,
    forecast: fc,
    recommendation: { ...cls, bufferRadiusSuggestion: 750 },
    data_status: "synthetic_prototype",
  };
}

module.exports = { STATIONS, STATION_DATA, CLUSTER_LABELS };
