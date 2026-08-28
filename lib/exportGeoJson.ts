import type { LngLat } from "./types";

export function downloadAoiGeoJson(ring: LngLat[], areaName: string) {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: areaName, source: "GDX-EI" },
        geometry: {
          type: "Polygon",
          coordinates: [ring.map((p) => [p.lng, p.lat])],
        },
      },
    ],
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${areaName.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.geojson`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
