import type { LngLat } from "./types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Approximate area of a lng/lat ring in km² using a spherical excess
 *  shoelace approximation. Good enough for AOI-scale polygons (not
 *  meant for cadastral precision). */
export function ringAreaKm2(ring: LngLat[]): number {
  if (ring.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % ring.length];
    total +=
      toRad(p2.lng - p1.lng) *
      (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  const areaSteradians = Math.abs((total * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2);
  return areaSteradians;
}

export function ringCentroid(ring: LngLat[]): LngLat {
  const lng = ring.reduce((sum, p) => sum + p.lng, 0) / ring.length;
  const lat = ring.reduce((sum, p) => sum + p.lat, 0) / ring.length;
  return { lng, lat };
}
