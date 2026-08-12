# GDX Earth Intelligence — API

FastAPI backend for the Nigeria Flood & Land-Change Monitoring System.
Currently returns deterministic mock indicators (see `app/mock_analysis.py`)
so the frontend has a real endpoint to call while Copernicus Data Space
Ecosystem (CDSE) API access is being set up.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /api/health` — liveness check
- `POST /api/analyze` — body: `{"coordinates": [[lng, lat], ...]}` (a
  closed polygon ring, matching what the frontend's draw tool emits).
  Returns the same `AnalysisResult` shape the frontend's
  `lib/mockAnalysis.ts` already produces:

  ```json
  {
    "areaName": "AOI 4.94, 7.54",
    "centroid": { "lng": 7.54, "lat": 4.94 },
    "areaKm2": 123.2,
    "imageDate": "2026-08-09",
    "cloudCoverPct": 9.1,
    "ndvi": 0.25,
    "ndwi": 0.28,
    "floodExtentPct": 18.1,
    "builtUpPct": 13.9,
    "changeSinceLastPct": 6.9
  }
  ```

- Interactive docs at `/docs` (Swagger UI) once running.

## Wiring the frontend to this API

Once this is running, point `runMockAnalysis` in the frontend's
`lib/mockAnalysis.ts` at `POST http://localhost:8000/api/analyze`
instead of generating numbers locally — the response shape already
matches, so no other frontend changes are needed.

## Next steps (real data)

Replace the body of `run_mock_analysis()` in `app/mock_analysis.py`
with:
1. Query CDSE (Sentinel Hub / openEO / STAC) for the AOI + date range
2. Filter by cloud cover
3. Pull required bands (B04/B08 for NDVI, B03/B08 for NDWI)
4. Compute indices with Rasterio/NumPy
5. For flood extent, run the equivalent against Sentinel-1 GRD (VV/VH)

`db/schema.sql` has PostGIS tables (`areas_of_interest`, `analyses`,
`imagery_metadata`) ready for when results should persist instead of
being recomputed on every request.
