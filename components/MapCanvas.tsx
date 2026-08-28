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

export type BasemapId = "dark" | "satellite";

type Props = {
  basemap: BasemapId;
  onAreaDrawn: (centroid: LngLat, areaKm2: number, ring: LngLat[]) => void;
  onAreaCleared: () => void;
  onCursorMove: (coords: LngLat | null) => void;
};

const BASEMAP_STYLES: Record<
  BasemapId,
  { tiles: string[]; attribution: string }
> = {
  dark: {
    tiles: [
      "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
    ],
    attribution:
      '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors',
  },
  satellite: {
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
  },
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

export default function MapCanvas({ basemap, onAreaDrawn, onAreaCleared, onCursorMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialStyle = BASEMAP_STYLES.dark;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tiles: initialStyle.tiles,
            tileSize: 256,
            attribution: initialStyle.attribution,
          },
        },
        layers: [{ id: "basemap-layer", type: "raster", source: "basemap" }],
      },
      center: NIGERIA_CENTER,
      zoom: 5.4,
      attributionControl: false,
    });

    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
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
      onAreaDrawn(ringCentroid(ring), ringAreaKm2(ring), ring);
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

  // Swap basemap tiles when the layers toggle changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const style = BASEMAP_STYLES[basemap];
    const source = map.getSource("basemap") as maplibregl_RasterSource | undefined;
    if (source && "setTiles" in source) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (source as any).setTiles(style.tiles);
    }
  }, [basemap]);

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

  useEffect(() => {
    const handler = () => {
      const map = mapRef.current;
      if (!map || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 11,
        });
      });
    };
    const el = document.getElementById("locate-trigger");
    el?.addEventListener("click", handler);
    return () => el?.removeEventListener("click", handler);
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}

// Minimal structural type so we don't need MapLibre's internal raster
// source class just to call setTiles().
type maplibregl_RasterSource = { setTiles?: (tiles: string[]) => void };
