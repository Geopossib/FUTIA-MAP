from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.mock_analysis import ring_area_km2, ring_centroid, run_mock_analysis
from app.models import AnalysisResult, AnalyzeRequest, LngLat

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalysisResult, response_model_by_alias=True)
def analyze(payload: AnalyzeRequest) -> AnalysisResult:
    if len(payload.coordinates) < 3:
        raise HTTPException(
            status_code=422, detail="A polygon needs at least 3 points."
        )

    ring = [LngLat(lng=pt[0], lat=pt[1]) for pt in payload.coordinates]
    centroid = ring_centroid(ring)
    area_km2 = ring_area_km2(ring)

    # TODO: replace with real Sentinel-2 (NDVI/NDWI) + Sentinel-1 (flood
    # extent) processing against the Copernicus Data Space Ecosystem
    # once API credentials are configured. See project notes for the
    # intended pipeline: query -> cloud filter -> bands -> indices.
    return run_mock_analysis(centroid, area_km2)
