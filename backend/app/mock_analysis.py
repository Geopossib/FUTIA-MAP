from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

from app.models import AnalysisResult, LngLat

EARTH_RADIUS_KM = 6371.0


def _to_rad(deg: float) -> float:
    return deg * math.pi / 180.0


def ring_area_km2(ring: list[LngLat]) -> float:
    """Spherical-excess shoelace approximation — same formula as
    lib/geo.ts on the frontend. Adequate for AOI-scale polygons, not
    cadastral precision."""
    if len(ring) < 3:
        return 0.0
    total = 0.0
    n = len(ring)
    for i in range(n):
        p1 = ring[i]
        p2 = ring[(i + 1) % n]
        total += _to_rad(p2.lng - p1.lng) * (
            2 + math.sin(_to_rad(p1.lat)) + math.sin(_to_rad(p2.lat))
        )
    return abs(total * EARTH_RADIUS_KM * EARTH_RADIUS_KM / 2)


def ring_centroid(ring: list[LngLat]) -> LngLat:
    lng = sum(p.lng for p in ring) / len(ring)
    lat = sum(p.lat for p in ring) / len(ring)
    return LngLat(lng=lng, lat=lat)


def _seeded_random(seed: float) -> float:
    x = math.sin(seed) * 10000
    return x - math.floor(x)


def _round(value: float, decimals: int = 2) -> float:
    factor = 10**decimals
    return round(value * factor) / factor


def run_mock_analysis(centroid: LngLat, area_km2: float) -> AnalysisResult:
    """Placeholder for the real pipeline: Sentinel-2 cloud-filtered
    bands -> NDVI/NDWI, Sentinel-1 GRD -> flood detection. Swap the
    body of this function for real CDSE/Sentinel Hub calls once API
    access is configured — the response shape is the contract the
    frontend already expects, so nothing else needs to change.
    """
    seed = centroid.lng * 1000 + centroid.lat * 7000 + area_km2

    image_date = (
        datetime.now(timezone.utc)
        - timedelta(days=int(_seeded_random(seed) * 6))
    ).strftime("%Y-%m-%d")

    return AnalysisResult(
        areaName=f"AOI {_round(centroid.lat, 3)}, {_round(centroid.lng, 3)}",
        centroid=centroid,
        areaKm2=_round(area_km2, 1),
        imageDate=image_date,
        cloudCoverPct=_round(_seeded_random(seed + 1) * 18, 1),
        ndvi=_round(0.15 + _seeded_random(seed + 2) * 0.6, 2),
        ndwi=_round(-0.2 + _seeded_random(seed + 3) * 0.5, 2),
        floodExtentPct=_round(_seeded_random(seed + 4) * 22, 1),
        builtUpPct=_round(_seeded_random(seed + 5) * 35, 1),
        changeSinceLastPct=_round((_seeded_random(seed + 6) - 0.5) * 14, 1),
    )
