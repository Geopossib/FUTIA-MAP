"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  AttributionControl,
} from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type { LngLat } from "@/lib/types";
import { ringAreaKm2, ringCentroid } from "@/lib/geo";

const NIGERIA_CENTER: [number, number] = [8.05, 9.1];

type Props = {
  onAreaDrawn: (centroid: LngLat, areaKm2: number) => void;
  onAreaCleared: () => void;
  onCursorMove: (coords: LngLat | null) => void;
};

// Draw styling tuned to the signal-green telemetry accent instead of
// mapbox-gl-draw's default blue.
const drawStyles = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: { "fill-color": "#22e0a3", "fill-opacity": 0.12 },
  },
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: { "line-color": "#22e0a3", "line-width": 2 },
  },
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"]],
    paint: { "line-color": "#22e0a3", "line-width": 2, "line-dasharray": [0.4, 2] },
  },
  {
    id: "gl-draw-point",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
    paint: { "circle-radius": 4, "circle-color": "#0a0f1a", "circle-stroke-color": "#22e0a3", "circle-stroke-width": 2 },
  },
];

export default function MapCanvas({ onAreaDrawn, onAreaCleared, onCursorMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors',
          },
        },
        layers: [
          { id: "carto-dark-layer", type: "raster", source: "carto-dark" },
        ],
      },
      center: NIGERIA_CENTER,
      zoom: 5.4,
      attributionControl: false,
    });

    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new ScaleControl({ maxWidth: 120, unit: "metric" }),
      "bottom-left"
    );

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: false, trash: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      styles: drawStyles as any,
    });
    // mapbox-gl-draw's types target mapbox-gl, not maplibre-gl. The two
    // implement a compatible-enough public API at runtime, so we bridge
    // the type mismatch here rather than fork the library.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.addControl(draw as any, "top-left");
    drawRef.current = draw;

    const handleDrawChange = () => {
      const data = draw.getAll();
      if (data.features.length === 0) {
        onAreaCleared();
        return;
      }
      const feature = data.features[data.features.length - 1];
      if (feature.geometry.type !== "Polygon") return;
      const ring: LngLat[] = feature.geometry.coordinates[0].map(
        (position) => ({ lng: position[0], lat: position[1] })
      );
      onAreaDrawn(ringCentroid(ring), ringAreaKm2(ring));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).on("draw.create", handleDrawChange);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).on("draw.update", handleDrawChange);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).on("draw.delete", () => onAreaCleared());

    map.on("mousemove", (e) => {
      onCursorMove({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });
    map.on("mouseout", () => onCursorMove(null));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => {
      const draw = drawRef.current;
      if (!draw) return;
      draw.deleteAll();
      draw.changeMode("draw_polygon");
    };
    const el = document.getElementById("draw-area-trigger");
    el?.addEventListener("click", handler);
    return () => el?.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handler = () => drawRef.current?.deleteAll();
    const el = document.getElementById("clear-area-trigger");
    el?.addEventListener("click", handler);
    return () => el?.removeEventListener("click", handler);
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
