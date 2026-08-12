import type { AnalysisResult, LngLat } from "./types";

// Deterministic pseudo-random helper so the same area always returns the
// same mock numbers during a session, rather than jittering on every call.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Placeholder for the real pipeline described in the project doc:
 *   Sentinel-2 -> cloud filter -> bands -> NDVI/NDWI
 *   Sentinel-1 -> GRD -> flood detection
 * Swap this out for calls to /api/analyze once Copernicus Data Space
 * Ecosystem (CDSE) API access is live — the return shape here is the
 * contract the frontend already expects.
 */
export async function runMockAnalysis(
  centroid: LngLat,
  areaKm2: number
): Promise<AnalysisResult> {
  // Simulate network + processing latency so the radar-sweep loading
  // state has something real to represent.
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const seed = centroid.lng * 1000 + centroid.lat * 7000 + areaKm2;

  return {
    areaName: `AOI ${round(centroid.lat, 3)}, ${round(centroid.lng, 3)}`,
    centroid,
    areaKm2: round(areaKm2, 1),
    imageDate: new Date(
      Date.now() - Math.floor(seededRandom(seed) * 6) * 86400000
    )
      .toISOString()
      .slice(0, 10),
    cloudCoverPct: round(seededRandom(seed + 1) * 18, 1),
    ndvi: round(0.15 + seededRandom(seed + 2) * 0.6, 2),
    ndwi: round(-0.2 + seededRandom(seed + 3) * 0.5, 2),
    floodExtentPct: round(seededRandom(seed + 4) * 22, 1),
    builtUpPct: round(seededRandom(seed + 5) * 35, 1),
    changeSinceLastPct: round((seededRandom(seed + 6) - 0.5) * 14, 1),
  };
}
