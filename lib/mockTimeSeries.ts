import type { LngLat, TimeSeriesPoint } from "./types";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Placeholder for repeated real Sentinel-2/Sentinel-1 analysis over
 * time. Once /api/analyze hits real data, this becomes a query for
 * the AOI's last N stored rows in the `analyses` table instead of a
 * generator.
 */
export async function runMockTimeSeries(
  centroid: LngLat,
  areaKm2: number,
  points = 6
): Promise<TimeSeriesPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const baseSeed = centroid.lng * 1000 + centroid.lat * 7000 + areaKm2;
  const series: TimeSeriesPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const seed = baseSeed + i * 13.7;
    // Slow drift + noise so the trend looks like a real seasonal signal
    // rather than pure noise.
    const drift = Math.sin((points - i) / 2) * 0.08;
    const date = new Date(Date.now() - i * 7 * 86400000)
      .toISOString()
      .slice(0, 10);

    series.push({
      date,
      ndvi: round(0.35 + drift + (seededRandom(seed) - 0.5) * 0.1, 2),
      ndwi: round(0.05 + drift * 0.5 + (seededRandom(seed + 1) - 0.5) * 0.08, 2),
      floodExtentPct: round(
        Math.max(0, 8 + drift * 40 + (seededRandom(seed + 2) - 0.5) * 6),
        1
      ),
    });
  }

  return series;
}
