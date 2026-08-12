export type LngLat = { lng: number; lat: number };

export type AnalysisResult = {
  areaName: string;
  centroid: LngLat;
  areaKm2: number;
  imageDate: string;
  cloudCoverPct: number;
  ndvi: number;
  ndwi: number;
  floodExtentPct: number;
  builtUpPct: number;
  changeSinceLastPct: number;
};
