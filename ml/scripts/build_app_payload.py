"""Combine validated ML artifacts into API-ready JSON and map GeoJSON."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ML_ROOT = ROOT / "ml"
STATUS = "synthetic_prototype"

BREAKDOWN_LABELS = {
    "passenger_volume_monthly": "Aktivitas penumpang",
    "passenger_growth_yoy_pct": "Pertumbuhan penumpang",
    "pedestrian_access_index": "Aksesibilitas pejalan kaki",
    "business_density_750m": "Kegiatan ekonomi",
    "land_property_availability_index": "Ketersediaan properti",
    "intermodal_connectivity_index": "Konektivitas antarmoda",
}


def read_csv(relative_path: str) -> list[dict[str, str]]:
    with (ML_ROOT / relative_path).open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def read_jsonl(relative_path: str) -> list[dict]:
    with (ML_ROOT / relative_path).open(encoding="utf-8") as file:
        return [json.loads(line) for line in file if line.strip()]


def main() -> None:
    scores = read_csv("regression_scoring/outputs/station_scores.csv")
    typologies = {row["station_id"]: row for row in read_csv("clustering/outputs/station_typologies.csv")}
    breakdowns = {row["station_id"]: row for row in read_csv("regression_scoring/outputs/indicator_breakdown.csv")}
    recommendations: dict[str, list[dict[str, str]]] = {}
    for row in read_csv("business_classification/outputs/location_recommendations.csv"):
        recommendations.setdefault(row["station_id"], []).append(row)
    forecasts: dict[str, list[dict[str, str]]] = {}
    for row in read_csv("forecasting/outputs/station_forecasts.csv"):
        forecasts.setdefault(row["station_id"], []).append(row)
    insights = {row["station_id"]: row for row in read_jsonl("llm_insight/outputs/station_insight_context.jsonl")}

    analyses = []
    features = []
    for score in scores:
        station_id = score["station_id"]
        typology = typologies[station_id]
        breakdown = breakdowns[station_id]
        station_recommendations = sorted(recommendations[station_id], key=lambda item: int(item["buffer_radius_m"]))
        station_forecasts = forecasts[station_id]
        components = [
            {
                "key": key,
                "label": label,
                "contribution": round(float(breakdown[key]), 2),
            }
            for key, label in BREAKDOWN_LABELS.items()
        ]
        display_score = round(sum(component["contribution"] for component in components), 2)
        analysis = {
            "station_id": station_id,
            "station_name": score["station_name"],
            "line": score["line"],
            "as_of_period": score["period"],
            "score": {
                "value": display_score,
                "rank": int(score["rank"]),
                "priority": score["investment_priority"],
                "method": score["score_method"],
                "model_prediction": float(score["model_predicted_investment_score"]),
                "model_method": score["model_method"],
                "breakdown": components,
            },
            "typology": {
                "cluster_id": int(typology["cluster_id"]),
                "label": typology["typology_label"],
            },
            "forecast": station_forecasts,
            "business_recommendations": [
                {
                    "location_id": row["location_id"],
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "radius_m": int(row["buffer_radius_m"]),
                    "category": row["recommended_category"],
                    "confidence": float(row["recommendation_confidence"]),
                    "top_3_categories": json.loads(row["top_3_categories"]),
                    "feature_reason": row["feature_reason"],
                }
                for row in station_recommendations
            ],
            "insight_context": insights[station_id],
            "source_status": STATUS,
            "data_limitations": "Synthetic prototype only; not a production investment or business recommendation.",
        }
        analyses.append(analysis)
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(typology["longitude"]), float(typology["latitude"])],
                },
                "properties": {
                    "station_id": station_id,
                    "station_name": score["station_name"],
                    "investment_score": analysis["score"]["value"],
                    "rank": analysis["score"]["rank"],
                    "typology_label": analysis["typology"]["label"],
                    "source_status": STATUS,
                },
            }
        )

    output_dir = ML_ROOT / "outputs"
    output_dir.mkdir(exist_ok=True)
    payload = {"source_status": STATUS, "stations": analyses}
    (output_dir / "station_analysis.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    geojson = {"type": "FeatureCollection", "features": features}
    (output_dir / "station_analysis.geojson").write_text(json.dumps(geojson, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"stations": len(analyses), "output": str(output_dir.relative_to(ROOT))}, ensure_ascii=False))


if __name__ == "__main__":
    main()
