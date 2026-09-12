"""Create the five reproducible ML notebooks specified in ml/docs."""

from pathlib import Path

import nbformat as nbf


ROOT = Path(__file__).resolve().parents[2]


def notebook(title: str, purpose: str, code: str):
    return nbf.v4.new_notebook(
        metadata={
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3"},
        },
        cells=[
            nbf.v4.new_markdown_cell(
                f"# {title}\n\n{purpose}\n\n"
                "Semua input dan output saat ini adalah prototipe sintetis. Hasil tidak boleh "
                "dianggap sebagai observasi lapangan atau rekomendasi bisnis/investasi produksi."
            ),
            nbf.v4.new_code_cell(
                "from pathlib import Path\n"
                "\n"
                "def find_root():\n"
                "    for candidate in [Path.cwd(), *Path.cwd().parents]:\n"
                "        if (candidate / 'ml' / 'DATASET_CATALOG.md').exists():\n"
                "            return candidate\n"
                "    raise FileNotFoundError('Jalankan notebook dari dalam repository TCI')\n"
                "\n"
                "ROOT = find_root()\n"
                "ML_ROOT = ROOT / 'ml'\n"
                "SEED = 20260911\n"
                "STATUS = 'synthetic_prototype'\n"
                "print(f'Project root: {ROOT}')"
            ),
            nbf.v4.new_code_cell(code),
        ],
    )


FORECASTING = r'''
import json
import pickle
import platform
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing

feature_dir = ML_ROOT / "forecasting"
data_path = feature_dir / "data" / "passenger_volume_monthly.csv"
crosswalk_path = ML_ROOT / "shared" / "processed" / "station_crosswalk.csv"
models_dir, outputs_dir = feature_dir / "models", feature_dir / "outputs"
models_dir.mkdir(parents=True, exist_ok=True)
outputs_dir.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(data_path, dtype={"station_code": str, "station_id": str})
crosswalk = pd.read_csv(crosswalk_path)
df["period_date"] = pd.to_datetime(df["period"] + "-01")
df = df.sort_values(["station_code", "period_date"]).reset_index(drop=True)

duplicate_count = int(df.duplicated(["station_code", "period"]).sum())
negative_count = int((df["passenger_volume_monthly"] < 0).sum())
missing_months = {}
for code, group in df.groupby("station_code"):
    expected = pd.date_range(group.period_date.min(), group.period_date.max(), freq="MS")
    missing = expected.difference(group.period_date)
    if len(missing):
        missing_months[code] = [value.strftime("%Y-%m") for value in missing]
invalid_coordinates = int((~crosswalk.latitude.between(-7.0, -5.8) | ~crosswalk.longitude.between(105.8, 107.5)).sum())
crosswalk_mismatch = int((set(df.station_code) ^ set(crosswalk.station_code)).__len__())
quality_passed = not (duplicate_count or negative_count or missing_months or invalid_coordinates or crosswalk_mismatch)
quality_report = {
    "passed": quality_passed,
    "record_count": len(df),
    "station_count": int(df.station_code.nunique()),
    "period_min": df.period.min(), "period_max": df.period.max(),
    "duplicate_station_periods": duplicate_count,
    "negative_volumes": negative_count,
    "missing_months_by_station": missing_months,
    "invalid_coordinates": invalid_coordinates,
    "crosswalk_mismatch_count": crosswalk_mismatch,
    "imputed_records": 0,
}
(outputs_dir / "data_quality_report.json").write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
if not quality_passed:
    raise ValueError("Forecasting quality gate failed; outputs are unavailable")

def seasonal_naive(train_values, horizon):
    values = list(map(float, train_values))
    result = []
    for _ in range(horizon):
        value = values[-12] if len(values) >= 12 else values[-1]
        result.append(value)
        values.append(value)
    return np.asarray(result)

station_metrics, validation_predictions = [], []
ets_wins = 0
for code, group in df.groupby("station_code", sort=True):
    train = group[group.period_date < "2025-01-01"]
    test = group[group.period_date >= "2025-01-01"]
    y_train = train.passenger_volume_monthly.to_numpy(dtype=float)
    actual = test.passenger_volume_monthly.to_numpy(dtype=float)
    baseline_pred = seasonal_naive(y_train, len(test))
    ets_fit = ExponentialSmoothing(
        y_train, trend="add", seasonal="add", seasonal_periods=12,
        initialization_method="estimated",
    ).fit(optimized=True, remove_bias=True)
    ets_pred = np.asarray(ets_fit.forecast(len(test)))
    baseline_mae = mean_absolute_error(actual, baseline_pred)
    ets_mae = mean_absolute_error(actual, ets_pred)
    ets_wins += int(ets_mae < baseline_mae)
    for period, truth, baseline, ets in zip(test.period, actual, baseline_pred, ets_pred):
        validation_predictions.append({"station_code": code, "period": period, "actual": truth, "seasonal_naive": baseline, "ets": ets})
    station_metrics.append({
        "station_code": code,
        "station_id": group.station_id.iloc[0],
        "seasonal_naive_mae": baseline_mae,
        "seasonal_naive_rmse": mean_squared_error(actual, baseline_pred) ** 0.5,
        "ets_mae": ets_mae,
        "ets_rmse": mean_squared_error(actual, ets_pred) ** 0.5,
    })

validation = pd.DataFrame(validation_predictions)
ets_consistent = ets_wins / df.station_code.nunique() >= 0.60
ets_better_overall = mean_absolute_error(validation.actual, validation.ets) < mean_absolute_error(validation.actual, validation.seasonal_naive)
selected_method = "ets_additive" if ets_consistent and ets_better_overall else "seasonal_naive"
selected_column = "ets" if selected_method == "ets_additive" else "seasonal_naive"

fitted_models, result_rows, clamp_count = {}, [], 0
for code, group in df.groupby("station_code", sort=True):
    metadata = group.iloc[0]
    values = group.passenger_volume_monthly.to_numpy(dtype=float)
    for row in group.itertuples():
        result_rows.append({
            "station_code": row.station_code, "station_id": row.station_id,
            "station_name": row.station_name, "line": row.line, "period": row.period,
            "record_type": "actual", "actual_passengers": int(row.passenger_volume_monthly),
            "predicted_passengers": None, "lower_80": None, "upper_80": None,
            "method": None, "source_status": "synthetic_prototype",
        })
    if selected_method == "ets_additive":
        fit = ExponentialSmoothing(values, trend="add", seasonal="add", seasonal_periods=12, initialization_method="estimated").fit(optimized=True, remove_bias=True)
        prediction = np.asarray(fit.forecast(3))
        fitted_models[code] = fit
    else:
        prediction = seasonal_naive(values, 3)
        fitted_models[code] = {"history": values[-12:].tolist()}
    residual = validation.loc[validation.station_code == code, "actual"] - validation.loc[validation.station_code == code, selected_column]
    sigma = float(np.sqrt(np.mean(np.square(residual))))
    future_periods = pd.date_range(group.period_date.max() + pd.offsets.MonthBegin(1), periods=3, freq="MS")
    for period, raw_prediction in zip(future_periods, prediction):
        clamp_count += int(raw_prediction < 0)
        point = max(0.0, float(raw_prediction))
        result_rows.append({
            "station_code": code, "station_id": metadata.station_id,
            "station_name": metadata.station_name, "line": metadata.line,
            "period": period.strftime("%Y-%m"), "record_type": "forecast",
            "actual_passengers": None, "predicted_passengers": round(point),
            "lower_80": round(max(0, point - 1.282 * sigma)), "upper_80": round(point + 1.282 * sigma),
            "method": selected_method, "source_status": "synthetic_prototype",
        })

bundle = {
    "model_type": selected_method, "models_by_station_code": fitted_models,
    "horizon_months": 3, "trained_through": df.period.max(),
    "station_crosswalk": crosswalk[["station_code", "station_id"]].to_dict("records"),
    "source_status": "synthetic_prototype",
}
with (models_dir / "forecasting_bundle.pkl").open("wb") as file:
    pickle.dump(bundle, file)
pd.DataFrame(result_rows).to_csv(outputs_dir / "station_forecasts.csv", index=False)

overall_actual = validation.actual.to_numpy()
overall_prediction = validation[selected_column].to_numpy()
metrics = {
    "selected_method": selected_method,
    "selection_rule": "ETS requires lower aggregate MAE and wins at least 60% of stations; otherwise seasonal-naive",
    "ets_station_win_rate": ets_wins / df.station_code.nunique(),
    "holdout": {"train": "2023-01..2024-12", "validation": "2025-01..2025-12"},
    "overall": {
        "mae": mean_absolute_error(overall_actual, overall_prediction),
        "rmse": mean_squared_error(overall_actual, overall_prediction) ** 0.5,
        "mae_pct_of_mean_actual": mean_absolute_error(overall_actual, overall_prediction) / overall_actual.mean() * 100,
        "rmse_pct_of_mean_actual": mean_squared_error(overall_actual, overall_prediction) ** 0.5 / overall_actual.mean() * 100,
    },
    "negative_predictions_clamped": clamp_count,
    "per_station": station_metrics,
    "source_status": "synthetic_prototype",
}
(outputs_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
schema = {"target": "passenger_volume_monthly", "identifier": ["station_code", "station_id"], "time_field": "period", "allowed_features": ["historical target values", "month/seasonality"], "horizon_months": 3}
(outputs_dir / "feature_schema.json").write_text(json.dumps(schema, indent=2), encoding="utf-8")
manifest = {"run_at_utc": datetime.now(timezone.utc).isoformat(), "source": str(data_path.relative_to(ROOT)), "records": len(df), "period_range": [df.period.min(), df.period.max()], "model": selected_method, "seed": SEED, "python": platform.python_version(), "sklearn": sklearn.__version__, "source_status": "synthetic_prototype", "limitations": "Synthetic 36-month history; forecasts are prototype-only."}
(outputs_dir / "run_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps({"quality_passed": quality_passed, "selected_method": selected_method, "forecast_rows": len(result_rows), "model": str(models_dir / 'forecasting_bundle.pkl')}, indent=2))
'''


CLUSTERING = r'''
import json
import pickle
import platform
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import sklearn
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

feature_dir = ML_ROOT / "clustering"
data_path = feature_dir / "data" / "station_master.csv"
models_dir, outputs_dir = feature_dir / "models", feature_dir / "outputs"
models_dir.mkdir(parents=True, exist_ok=True)
outputs_dir.mkdir(parents=True, exist_ok=True)
df = pd.read_csv(data_path)

numeric = ["connected_lines", "is_transit_hub", "distance_to_monas_km", "annual_passengers_2025", "daily_passengers_2025", "yoy_growth_2025_pct", "business_density_750m", "pedestrian_access_index"]
categorical = ["station_type", "line", "city_regency"]
duplicate_codes = int(df.station_code.duplicated().sum())
invalid_coordinates = int((~df.latitude.between(-7.0, -5.8) | ~df.longitude.between(105.8, 107.5)).sum())
missing_values = {column: int(value) for column, value in df[numeric + categorical].isna().sum().items() if value}
quality_passed = not (duplicate_codes or invalid_coordinates or missing_values)
quality_report = {"passed": quality_passed, "record_count": len(df), "station_count": int(df.station_code.nunique()), "duplicate_station_codes": duplicate_codes, "invalid_coordinates": invalid_coordinates, "missing_values": missing_values}
(outputs_dir / "data_quality_report.json").write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
if not quality_passed:
    raise ValueError("Clustering quality gate failed; outputs are unavailable")

preprocessor = ColumnTransformer([
    ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric),
    ("categorical", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), categorical),
])
matrix = preprocessor.fit_transform(df[numeric + categorical])
candidates = []
for k in range(2, 6):
    model = KMeans(n_clusters=k, random_state=SEED, n_init=30).fit(matrix)
    sizes = pd.Series(model.labels_).value_counts().sort_index().to_dict()
    candidates.append({"k": k, "silhouette": silhouette_score(matrix, model.labels_), "cluster_sizes": {str(key): int(value) for key, value in sizes.items()}, "has_singleton": min(sizes.values()) == 1})
valid_candidates = [candidate for candidate in candidates if not candidate["has_singleton"]]
if not valid_candidates:
    raise ValueError("All candidate clusterings contain a singleton")
selected = max(valid_candidates, key=lambda item: item["silhouette"])
model = KMeans(n_clusters=selected["k"], random_state=SEED, n_init=30).fit(matrix)
df["cluster_id"] = model.labels_

profiles = df.groupby("cluster_id").agg(
    station_count=("station_code", "size"),
    annual_passengers_mean=("annual_passengers_2025", "mean"),
    daily_passengers_mean=("daily_passengers_2025", "mean"),
    yoy_growth_mean_pct=("yoy_growth_2025_pct", "mean"),
    connected_lines_mean=("connected_lines", "mean"),
    transit_hub_share=("is_transit_hub", "mean"),
    business_density_mean=("business_density_750m", "mean"),
    pedestrian_access_mean=("pedestrian_access_index", "mean"),
    distance_to_monas_mean_km=("distance_to_monas_km", "mean"),
).reset_index()
activity = (
    profiles.annual_passengers_mean.rank(pct=True)
    + profiles.connected_lines_mean.rank(pct=True)
    + profiles.transit_hub_share.rank(pct=True)
    + profiles.business_density_mean.rank(pct=True)
    + profiles.pedestrian_access_mean.rank(pct=True)
    - profiles.distance_to_monas_mean_km.rank(pct=True)
)
ordered = profiles.assign(activity_index=activity).sort_values("activity_index").cluster_id.tolist()
label_options = {
    2: ["Aktivitas lebih rendah", "Hub aktivitas tinggi"],
    3: ["Aktivitas lebih rendah", "Koridor komuter menengah", "Hub aktivitas tinggi"],
    4: ["Aktivitas lebih rendah", "Koridor komuter menengah", "Hub berkembang", "Hub aktivitas tinggi"],
    5: ["Aktivitas lebih rendah", "Koridor lokal", "Koridor komuter menengah", "Hub berkembang", "Hub aktivitas tinggi"],
}
label_map = {int(cluster): label for cluster, label in zip(ordered, label_options[selected["k"]])}
df["typology_label"] = df.cluster_id.map(label_map)
df["source_status"] = "synthetic_prototype"
output_columns = ["station_code", "station_id", "station_name", "line", "latitude", "longitude", "cluster_id", "typology_label", "source_status"]
df[output_columns].to_csv(outputs_dir / "station_typologies.csv", index=False)

profile_records = []
for row in profiles.itertuples(index=False):
    profile_records.append({
        "cluster_id": int(row.cluster_id), "label": label_map[int(row.cluster_id)],
        "station_count": int(row.station_count),
        "annual_passengers_mean": row.annual_passengers_mean,
        "daily_passengers_mean": row.daily_passengers_mean,
        "yoy_growth_mean_pct": row.yoy_growth_mean_pct,
        "connected_lines_mean": row.connected_lines_mean,
        "transit_hub_share": row.transit_hub_share,
        "business_density_mean": row.business_density_mean,
        "pedestrian_access_mean": row.pedestrian_access_mean,
        "distance_to_monas_mean_km": row.distance_to_monas_mean_km,
    })
(outputs_dir / "cluster_profiles.json").write_text(json.dumps({"selected_k": selected["k"], "silhouette": selected["silhouette"], "profiles": profile_records, "source_status": "synthetic_prototype"}, indent=2), encoding="utf-8")
artifact = {"preprocessor": preprocessor, "model": model, "numeric_features": numeric, "categorical_features": categorical, "cluster_label_map": label_map, "source_status": "synthetic_prototype"}
with (models_dir / "typology_pipeline.pkl").open("wb") as file:
    pickle.dump(artifact, file)
(outputs_dir / "metrics.json").write_text(json.dumps({"selected_k": selected["k"], "selected_silhouette": selected["silhouette"], "candidates": candidates, "label_mapping": label_map, "source_status": "synthetic_prototype"}, indent=2), encoding="utf-8")
(outputs_dir / "feature_schema.json").write_text(json.dumps({"numeric_features": numeric, "categorical_features": categorical, "identifier_fields": ["station_code", "station_id"], "target": None}, indent=2), encoding="utf-8")
manifest = {"run_at_utc": datetime.now(timezone.utc).isoformat(), "source": str(data_path.relative_to(ROOT)), "records": len(df), "selected_k": selected["k"], "seed": SEED, "python": platform.python_version(), "sklearn": sklearn.__version__, "source_status": "synthetic_prototype", "limitations": "Typologies use synthetic transit profiles; labels are descriptive, not residential/property claims."}
(outputs_dir / "run_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps({"quality_passed": quality_passed, "selected_k": selected["k"], "silhouette": selected["silhouette"], "model": str(models_dir / 'typology_pipeline.pkl')}, indent=2))
'''


REGRESSION = r'''
import json
import pickle
import platform
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import ElasticNet
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

feature_dir = ML_ROOT / "regression_scoring"
data_path = feature_dir / "data" / "station_month_features.csv"
models_dir, outputs_dir = feature_dir / "models", feature_dir / "outputs"
models_dir.mkdir(parents=True, exist_ok=True)
outputs_dir.mkdir(parents=True, exist_ok=True)
df = pd.read_csv(data_path)
df["period_date"] = pd.to_datetime(df.period + "-01")

features = ["passenger_volume_monthly", "passenger_growth_yoy_pct", "business_density_750m", "poi_density_750m", "pedestrian_access_index", "land_property_availability_index", "intermodal_connectivity_index", "estimated_rental_index_rp_thousand_m2_month", "distance_to_cbd_km"]
target = "investment_potential_score"
duplicates = int(df.duplicated(["station_code", "period"]).sum())
missing = {column: int(value) for column, value in df[features + [target]].isna().sum().items() if value}
out_of_range_targets = int((~df[target].between(0, 100)).sum())
invalid_status = int((df.source_status != STATUS).sum())
quality_passed = not (duplicates or missing or out_of_range_targets or invalid_status)
quality_report = {"passed": quality_passed, "record_count": len(df), "station_count": int(df.station_code.nunique()), "period_min": df.period.min(), "period_max": df.period.max(), "duplicate_station_periods": duplicates, "missing_values": missing, "targets_outside_0_100": out_of_range_targets, "invalid_source_status": invalid_status}
(outputs_dir / "data_quality_report.json").write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
if not quality_passed:
    raise ValueError("Regression quality gate failed; outputs are unavailable")

train = df[df.period_date < "2025-01-01"].copy()
test = df[df.period_date >= "2025-01-01"].copy()
X_train, y_train = train[features], train[target]
X_test, y_test = test[features], test[target]

def weighted_score(frame, reference):
    definitions = {
        "passenger_volume_monthly": (0.26, True),
        "passenger_growth_yoy_pct": (0.12, True),
        "pedestrian_access_index": (0.17, True),
        "business_density_750m": (0.14, True),
        "land_property_availability_index": (0.15, True),
        "intermodal_connectivity_index": (0.16, True),
    }
    total = np.zeros(len(frame), dtype=float)
    breakdown = {}
    for column, (weight, positive) in definitions.items():
        low, high = reference[column].min(), reference[column].max()
        normalized = ((frame[column] - low) / (high - low)).clip(0, 1) if high > low else pd.Series(0.5, index=frame.index)
        if not positive:
            normalized = 1 - normalized
        breakdown[column] = normalized * weight * 100
        total += breakdown[column].to_numpy()
    return total, pd.DataFrame(breakdown, index=frame.index)

elastic = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler()), ("model", ElasticNet(alpha=0.05, l1_ratio=0.2, random_state=SEED, max_iter=20000))])
forest = Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", RandomForestRegressor(n_estimators=400, min_samples_leaf=3, max_features=0.8, random_state=SEED, n_jobs=-1))])
candidates = {"elastic_net": elastic, "random_forest": forest}
candidate_metrics = {}
for name, pipeline in candidates.items():
    pipeline.fit(X_train, y_train)
    prediction = np.clip(pipeline.predict(X_test), 0, 100)
    candidate_metrics[name] = {"mae": mean_absolute_error(y_test, prediction), "rmse": mean_squared_error(y_test, prediction) ** 0.5}
weighted_prediction, _ = weighted_score(X_test, X_train)
candidate_metrics["weighted_prototype_baseline"] = {"mae": mean_absolute_error(y_test, weighted_prediction), "rmse": mean_squared_error(y_test, weighted_prediction) ** 0.5}
selected_name = min(("elastic_net", "random_forest"), key=lambda name: candidate_metrics[name]["mae"])
selected_pipeline = candidates[selected_name]

# Refit the selected ML pipeline on all synthetic development records for export.
selected_pipeline.fit(df[features], df[target])
latest = df.sort_values("period_date").groupby("station_code", as_index=False).tail(1).copy()
weighted_latest, breakdown = weighted_score(latest[features], df[features])
latest["model_predicted_investment_score"] = np.clip(selected_pipeline.predict(latest[features]), 0, 100).round(2)
latest["investment_score"] = weighted_latest.round(2)
latest["rank"] = latest.investment_score.rank(method="min", ascending=False).astype(int)
latest["investment_priority"] = pd.cut(latest.investment_score, bins=[-np.inf, 45, 70, np.inf], labels=["Low", "Medium", "High"], right=False).astype(str)
latest["score_method"] = "weighted_prototype"
latest["model_method"] = f"{selected_name}_synthetic_prototype"
latest["source_status"] = STATUS
score_columns = ["station_code", "station_id", "station_name", "line", "period", "investment_score", "rank", "investment_priority", "score_method", "model_predicted_investment_score", "model_method", "source_status"]
latest[score_columns].sort_values("rank").to_csv(outputs_dir / "station_scores.csv", index=False)

breakdown.insert(0, "station_name", latest.station_name.to_numpy())
breakdown.insert(0, "station_id", latest.station_id.to_numpy())
breakdown.insert(0, "station_code", latest.station_code.to_numpy())
breakdown["investment_score"] = weighted_latest.round(2)
breakdown["score_method"] = latest.score_method.to_numpy()
breakdown["source_status"] = STATUS
breakdown.to_csv(outputs_dir / "indicator_breakdown.csv", index=False)

if selected_name == "random_forest":
    importance = dict(zip(features, selected_pipeline.named_steps["model"].feature_importances_))
else:
    importance = dict(zip(features, np.abs(selected_pipeline.named_steps["model"].coef_)))
importance = dict(sorted(((key, float(value)) for key, value in importance.items()), key=lambda item: item[1], reverse=True))
artifact = {"pipeline": selected_pipeline, "features": features, "selected_model": selected_name, "target": target, "source_status": STATUS, "warning": "Synthetic target; not a production investment score."}
with (models_dir / "investment_score_pipeline.pkl").open("wb") as file:
    pickle.dump(artifact, file)
metrics = {"selected_model": selected_name, "selection_metric": "holdout MAE", "published_score_method": "weighted_prototype", "split": {"train": "2023-01..2024-12", "test": "2025-01..2025-12"}, "candidates": candidate_metrics, "feature_importance_not_causal": importance, "source_status": STATUS, "limitation": "Targets are formula-generated; metrics only measure reproduction of synthetic patterns. The published score is deterministic so its indicator breakdown is exact."}
(outputs_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
(outputs_dir / "feature_schema.json").write_text(json.dumps({"features": features, "target": target, "identifier_fields": ["station_code", "station_id"], "excluded_from_training": ["record_id", "station_name", "line", "period", "investment_priority", "target_provenance", "source_status"]}, indent=2), encoding="utf-8")
manifest = {"run_at_utc": datetime.now(timezone.utc).isoformat(), "source": str(data_path.relative_to(ROOT)), "records": len(df), "period_range": [df.period.min(), df.period.max()], "model": selected_name, "seed": SEED, "python": platform.python_version(), "sklearn": sklearn.__version__, "source_status": STATUS, "limitations": "Synthetic proxies and formula-generated target; API must not present this as a production predictive score."}
(outputs_dir / "run_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps({"quality_passed": quality_passed, "selected_model": selected_name, "test_metrics": candidate_metrics[selected_name], "model": str(models_dir / 'investment_score_pipeline.pkl')}, indent=2))
'''


CLASSIFICATION = r'''
import json
import pickle
import platform
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import balanced_accuracy_score, confusion_matrix, f1_score, top_k_accuracy_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

feature_dir = ML_ROOT / "business_classification"
data_path = feature_dir / "data" / "location_opportunity_training.csv"
models_dir, outputs_dir = feature_dir / "models", feature_dir / "outputs"
models_dir.mkdir(parents=True, exist_ok=True)
outputs_dir.mkdir(parents=True, exist_ok=True)
df = pd.read_csv(data_path)
df["month"] = pd.to_datetime(df.period + "-01").dt.month

features = ["buffer_radius_m", "estimated_daily_footfall", "passenger_volume_monthly", "food_poi_count", "beverage_poi_count", "hobby_poi_count", "bookstore_poi_count", "other_retail_poi_count", "office_activity_index", "residential_activity_index", "education_activity_index", "pedestrian_access_index", "estimated_rental_index_rp_thousand_m2_month", "month"]
target = "recommended_business_category"
duplicates = int(df.record_id.duplicated().sum())
missing = {column: int(value) for column, value in df[features + [target]].isna().sum().items() if value}
invalid_status = int((df.source_status != STATUS).sum())
quality_passed = not (duplicates or missing or invalid_status)
quality_report = {"passed": quality_passed, "record_count": len(df), "station_count": int(df.station_code.nunique()), "duplicate_record_ids": duplicates, "missing_values": missing, "class_distribution": {str(key): int(value) for key, value in df[target].value_counts().items()}, "invalid_source_status": invalid_status}
(outputs_dir / "data_quality_report.json").write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
if not quality_passed:
    raise ValueError("Classification quality gate failed; outputs are unavailable")

all_classes = sorted(df[target].unique())
splitter = GroupShuffleSplit(n_splits=50, test_size=0.2, random_state=SEED)
train_idx = test_idx = None
for candidate_train, candidate_test in splitter.split(df[features], df[target], groups=df.station_code):
    if set(df.iloc[candidate_train][target]) == set(all_classes) and set(df.iloc[candidate_test][target]) == set(all_classes):
        train_idx, test_idx = candidate_train, candidate_test
        break
if train_idx is None:
    raise ValueError("Unable to make a station-group holdout containing every category")
train, test = df.iloc[train_idx], df.iloc[test_idx]
X_train, y_train = train[features], train[target]
X_test, y_test = test[features], test[target]

logistic = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler()), ("model", LogisticRegression(max_iter=4000, class_weight="balanced", random_state=SEED))])
forest = Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", RandomForestClassifier(n_estimators=500, min_samples_leaf=2, class_weight="balanced_subsample", random_state=SEED, n_jobs=-1))])
candidates = {"logistic_regression": logistic, "random_forest": forest}
candidate_metrics = {}
for name, pipeline in candidates.items():
    pipeline.fit(X_train, y_train)
    prediction = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)
    labels = pipeline.named_steps["model"].classes_
    candidate_metrics[name] = {
        "macro_f1": f1_score(y_test, prediction, average="macro"),
        "balanced_accuracy": balanced_accuracy_score(y_test, prediction),
        "top_3_accuracy": top_k_accuracy_score(y_test, probabilities, k=min(3, len(labels)), labels=labels),
        "confusion_matrix": confusion_matrix(y_test, prediction, labels=all_classes).tolist(),
        "confusion_matrix_labels": all_classes,
    }
selected_name = max(candidates, key=lambda name: (candidate_metrics[name]["macro_f1"], candidate_metrics[name]["balanced_accuracy"]))
selected_pipeline = candidates[selected_name]
selected_pipeline.fit(df[features], df[target])

latest = df.sort_values("period").groupby(["station_code", "location_id", "buffer_radius_m"], as_index=False).tail(1).copy()
probabilities = selected_pipeline.predict_proba(latest[features])
classes = selected_pipeline.named_steps["model"].classes_
order = np.argsort(probabilities, axis=1)[:, ::-1]
latest["recommended_category"] = [classes[indexes[0]] for indexes in order]
latest["recommendation_confidence"] = [round(float(row[indexes[0]]), 4) for row, indexes in zip(probabilities, order)]
latest["top_3_categories"] = [json.dumps([classes[index] for index in indexes[:3]], ensure_ascii=False) for indexes in order]

if selected_name == "random_forest":
    importance_values = selected_pipeline.named_steps["model"].feature_importances_
else:
    importance_values = np.abs(selected_pipeline.named_steps["model"].coef_).mean(axis=0)
importance = dict(sorted(zip(features, map(float, importance_values)), key=lambda item: item[1], reverse=True))
reason_features = list(importance)[:3]
latest["feature_reason"] = "Fitur model paling berpengaruh: " + ", ".join(reason_features) + "."
latest["source_status"] = STATUS
latest["recommendation_status"] = "prototype_only_not_validated_business_outcome"
output_columns = ["location_id", "latitude", "longitude", "station_code", "station_id", "station_name", "period", "buffer_radius_m", "recommended_category", "recommendation_confidence", "top_3_categories", "feature_reason", "recommendation_status", "source_status"]
latest[output_columns].to_csv(outputs_dir / "location_recommendations.csv", index=False)

artifact = {"pipeline": selected_pipeline, "features": features, "selected_model": selected_name, "classes": classes.tolist(), "source_status": STATUS, "warning": "Synthetic labels; not a validated best-business recommendation."}
with (models_dir / "business_recommender.pkl").open("wb") as file:
    pickle.dump(artifact, file)
metrics = {"selected_model": selected_name, "selection_metric": "station-group holdout macro F1", "split": {"strategy": "GroupShuffleSplit by station_code", "train_station_count": int(train.station_code.nunique()), "test_station_count": int(test.station_code.nunique()), "station_overlap": len(set(train.station_code) & set(test.station_code))}, "candidates": candidate_metrics, "global_feature_importance": importance, "source_status": STATUS, "limitation": "Labels are synthetic and imbalanced; metrics do not validate real business outcomes."}
(outputs_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
(outputs_dir / "feature_schema.json").write_text(json.dumps({"features": features, "target": target, "identifier_fields": ["record_id", "location_id", "station_code", "station_id"], "geometry_fields": ["latitude", "longitude"], "grain": "location-station-month-radius", "published_radii_m": [500, 750, 1000], "excluded_from_training": ["synthetic_recommendation_confidence", "label_provenance", "source_status"]}, indent=2), encoding="utf-8")
manifest = {"run_at_utc": datetime.now(timezone.utc).isoformat(), "source": str(data_path.relative_to(ROOT)), "records": len(df), "model": selected_name, "seed": SEED, "python": platform.python_version(), "sklearn": sklearn.__version__, "source_status": STATUS, "limitations": "Synthetic proxies and labels; Hotspot Finder must not claim this is a validated best category."}
(outputs_dir / "run_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps({"quality_passed": quality_passed, "selected_model": selected_name, "test_macro_f1": candidate_metrics[selected_name]["macro_f1"], "model": str(models_dir / 'business_recommender.pkl')}, indent=2))
'''


LLM = r'''
import json
import platform
from datetime import datetime, timezone

import pandas as pd

feature_dir = ML_ROOT / "llm_insight"
evaluation_path = feature_dir / "data" / "smart_query_evaluation.csv"
outputs_dir = feature_dir / "outputs"
outputs_dir.mkdir(parents=True, exist_ok=True)

scores = pd.read_csv(ML_ROOT / "regression_scoring" / "outputs" / "station_scores.csv")
typologies = pd.read_csv(ML_ROOT / "clustering" / "outputs" / "station_typologies.csv")
recommendations = pd.read_csv(ML_ROOT / "business_classification" / "outputs" / "location_recommendations.csv")
forecasts = pd.read_csv(ML_ROOT / "forecasting" / "outputs" / "station_forecasts.csv")
cases = pd.read_csv(evaluation_path)

contexts = {}
for score in scores.itertuples(index=False):
    station_id = score.station_id
    typology = typologies.loc[typologies.station_id == station_id].iloc[0]
    recommendation = recommendations.loc[(recommendations.station_id == station_id) & (recommendations.buffer_radius_m == 750)].iloc[0]
    station_forecasts = forecasts.loc[forecasts.station_id == station_id]
    actual = station_forecasts.loc[station_forecasts.record_type == "actual"].tail(3)
    forecast = station_forecasts.loc[station_forecasts.record_type == "forecast"]
    contexts[station_id] = {
        "station_id": station_id,
        "station_name": score.station_name,
        "line": score.line,
        "as_of_period": score.period,
        "investment_potential_score": float(score.investment_score),
        "investment_rank": int(score.rank),
        "score_method": score.score_method,
        "typology": {"cluster_id": int(typology.cluster_id), "label": typology.typology_label},
        "passenger_volume_recent_3m": actual.actual_passengers.astype(int).tolist(),
        "forecast_next_3m": forecast[["period", "predicted_passengers", "lower_80", "upper_80", "method"]].to_dict("records"),
        "business_recommendation": {"location_id": recommendation.location_id, "category": recommendation.recommended_category, "confidence": float(recommendation.recommendation_confidence), "buffer_radius_m": int(recommendation.buffer_radius_m)},
        "source_status": STATUS,
    }
context_path = outputs_dir / "station_insight_context.jsonl"
with context_path.open("w", encoding="utf-8") as file:
    for payload in contexts.values():
        file.write(json.dumps(payload, ensure_ascii=False) + "\n")

duplicate_contexts = len(contexts) != len(scores)
missing_context_ids = sorted(set(cases.station_id) - set(contexts))
invalid_status = int((cases.source_status != STATUS).sum()) + sum(value.get("source_status") != STATUS for value in contexts.values()) + int((scores.source_status != STATUS).sum()) + int((typologies.source_status != STATUS).sum()) + int((recommendations.source_status != STATUS).sum()) + int((forecasts.source_status != STATUS).sum())
quality_passed = not (duplicate_contexts or missing_context_ids or invalid_status)
quality_report = {"passed": quality_passed, "context_count": len(contexts), "evaluation_case_count": len(cases), "duplicate_context_station_ids": duplicate_contexts, "missing_context_station_ids": missing_context_ids, "invalid_source_status_count": invalid_status}
(outputs_dir / "data_quality_report.json").write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
if not quality_passed:
    raise ValueError("LLM insight quality gate failed; responses are unavailable")

def nested_value(payload, dotted_key):
    value = payload
    for key in dotted_key.split("."):
        value = value[key]
    return value

def deterministic_response(context, intent):
    station = context["station_name"]
    limitation = "Semua angka dan atribut adalah prototipe sintetis, bukan observasi lapangan atau dasar keputusan final."
    evidence = [{"key": "station_name", "value": station}, {"key": "source_status", "value": context["source_status"]}]
    if intent == "station_summary":
        score = context["investment_potential_score"]
        summary = f"{station} memiliki skor potensi sintetis {score:.2f}/100 pada {context['as_of_period']}."
        evidence.append({"key": "investment_potential_score", "value": score})
        map_action = {"type": "focus_station", "station_id": context["station_id"]}
    elif intent == "business_category":
        recommendation = context["business_recommendation"]
        summary = f"Kategori yang dapat dieksplorasi pada radius {recommendation['buffer_radius_m']} m di {station} adalah {recommendation['category']}."
        evidence.append({"key": "business_recommendation.category", "value": recommendation["category"]})
        map_action = None
    else:
        summary = f"Insight {station} belum dapat dianggap andal untuk keputusan nyata karena seluruh input masih sintetis."
        map_action = None
    response = {"summary": summary, "evidence": evidence, "limitations": [limitation]}
    if map_action and map_action["station_id"] in contexts:
        response["map_action"] = map_action
    return response

results, passed_count = [], 0
for case in cases.itertuples(index=False):
    context = contexts[case.station_id]
    response = deterministic_response(context, case.intent)
    required_keys = json.loads(case.required_fact_keys)
    evidence_by_key = {item["key"]: item["value"] for item in response["evidence"]}
    grounded = all(key in evidence_by_key and evidence_by_key[key] == nested_value(context, key) for key in required_keys)
    limitation_passed = (not bool(case.must_include_limitation)) or any("sintetis" in text.lower() for text in response["limitations"])
    forbidden_advice_passed = not any(term in response["summary"].lower() for term in ["pasti untung", "wajib investasi", "izin dijamin"])
    map_action_valid = "map_action" not in response or response["map_action"].get("station_id") in contexts
    passed = grounded and limitation_passed and forbidden_advice_passed and map_action_valid
    passed_count += int(passed)
    results.append({"case_id": case.case_id, "station_id": case.station_id, "intent": case.intent, "response": response, "checks": {"grounded_required_facts": grounded, "includes_synthetic_limitation": limitation_passed, "no_forbidden_final_advice": forbidden_advice_passed, "valid_map_action": map_action_valid}, "passed": passed, "source_status": STATUS})

with (outputs_dir / "insight_evaluations.jsonl").open("w", encoding="utf-8") as file:
    for result in results:
        file.write(json.dumps(result, ensure_ascii=False) + "\n")
metrics = {"cases": len(results), "passed": passed_count, "pass_rate": passed_count / len(results), "mode": "deterministic_template_fallback", "source_status": STATUS, "limitation": "This evaluates grounding and response schema, not LLM model quality or fine-tuning."}
(outputs_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
schema = {"required_response_fields": ["summary", "evidence", "limitations"], "optional_response_fields": ["map_action"], "allowed_map_action": {"type": "focus_station", "station_id": "must exist in validated context"}, "local_model_artifact": None, "reason_no_pkl": "LLM API is not a local model trained by this project."}
(outputs_dir / "feature_schema.json").write_text(json.dumps(schema, indent=2), encoding="utf-8")
manifest = {"run_at_utc": datetime.now(timezone.utc).isoformat(), "sources": ["ml/regression_scoring/outputs/station_scores.csv", "ml/clustering/outputs/station_typologies.csv", "ml/business_classification/outputs/location_recommendations.csv", "ml/forecasting/outputs/station_forecasts.csv", str(evaluation_path.relative_to(ROOT))], "context_output": str(context_path.relative_to(ROOT)), "records": {"contexts": len(contexts), "cases": len(cases)}, "python": platform.python_version(), "source_status": STATUS, "limitations": "Prompt/guardrail fixture only; no local model and intentionally no .pkl artifact."}
(outputs_dir / "run_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps({"quality_passed": quality_passed, "evaluation_pass_rate": metrics["pass_rate"], "output": str(outputs_dir / 'insight_evaluations.jsonl'), "pkl_created": False}, indent=2))
'''


NOTEBOOKS = {
    "ml/forecasting/notebooks/train_forecasting.ipynb": notebook(
        "Forecasting volume penumpang",
        "Membandingkan seasonal-naive dengan ETS additive pada holdout 2025, memilih metode sederhana secara eksplisit, lalu membuat forecast tiga bulan.",
        FORECASTING,
    ),
    "ml/clustering/notebooks/train_clustering.ipynb": notebook(
        "Clustering tipologi stasiun",
        "Mengevaluasi KMeans k=2..5 dengan silhouette, menolak singleton, dan menerjemahkan cluster menjadi label transit yang dapat dijelaskan.",
        CLUSTERING,
    ),
    "ml/regression_scoring/notebooks/train_investment_model.ipynb": notebook(
        "Regression investment score sintetis",
        "Membandingkan ElasticNet dan Random Forest dengan weighted baseline. Target formula sintetis hanya untuk pengujian pipeline dan kontrak artefak.",
        REGRESSION,
    ),
    "ml/business_classification/notebooks/train_business_recommender.ipynb": notebook(
        "Classification rekomendasi usaha sintetis",
        "Mengevaluasi classifier dengan holdout berbasis stasiun. Label sintetis tidak membuktikan kategori usaha terbaik di dunia nyata.",
        CLASSIFICATION,
    ),
    "ml/llm_insight/notebooks/evaluate_insight_prompts.ipynb": notebook(
        "Evaluasi LLM insight dan smart query",
        "Menguji grounding, schema respons, disclaimer, dan map action melalui fallback template deterministik. Sesuai kontrak, notebook ini tidak melatih model lokal dan tidak membuat .pkl.",
        LLM,
    ),
}


def main():
    for relative_path, value in NOTEBOOKS.items():
        path = ROOT / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        nbf.write(value, path)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
