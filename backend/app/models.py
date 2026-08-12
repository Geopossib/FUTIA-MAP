from __future__ import annotations

from pydantic import BaseModel, Field


class LngLat(BaseModel):
    lng: float
    lat: float


class AnalyzeRequest(BaseModel):
    """A GeoJSON-style polygon ring, matching what the frontend's
    mapbox-gl-draw control emits: a single ring of [lng, lat] pairs,
    first and last point equal."""

    coordinates: list[list[float]] = Field(
        ..., description="Ring of [lng, lat] pairs forming the drawn polygon"
    )


class AnalysisResult(BaseModel):
    """Mirrors lib/types.ts::AnalysisResult in the frontend exactly —
    keep the two in sync when either changes."""

    area_name: str = Field(..., alias="areaName")
    centroid: LngLat
    area_km2: float = Field(..., alias="areaKm2")
    image_date: str = Field(..., alias="imageDate")
    cloud_cover_pct: float = Field(..., alias="cloudCoverPct")
    ndvi: float
    ndwi: float
    flood_extent_pct: float = Field(..., alias="floodExtentPct")
    built_up_pct: float = Field(..., alias="builtUpPct")
    change_since_last_pct: float = Field(..., alias="changeSinceLastPct")

    model_config = {"populate_by_name": True}
