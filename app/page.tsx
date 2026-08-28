"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import TopNav from "@/components/TopNav";
import ControlPanel from "@/components/ControlPanel";
import ScenesPanel from "@/components/ScenesPanel";
import MapChrome from "@/components/MapChrome";
import type { BasemapId } from "@/components/MapCanvas";
import type { AnalysisResult, LngLat } from "@/lib/types";
import { runMockAnalysis } from "@/lib/mockAnalysis";

// MapLibre touches `window` on import, so the canvas must never render
// during SSR.
const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
});

export default function Home() {
  const [, setCursor] = useState<LngLat | null>(null);
  const [basemap, setBasemap] = useState<BasemapId>("dark");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aoiRing, setAoiRing] = useState<LngLat[] | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<"ndvi" | "ndwi" | null>(null);
  const requestId = useRef(0);

  const handleAreaDrawn = useCallback(
    async (centroid: LngLat, areaKm2: number, ring: LngLat[]) => {
      const thisRequest = ++requestId.current;
      setAoiRing(ring);
      setLoading(true);
      setResult(null);
      setAppliedIndex(null);
      const analysis = await runMockAnalysis(centroid, areaKm2);
      if (requestId.current === thisRequest) {
        setResult(analysis);
        setLoading(false);
      }
    },
    []
  );

  const handleAreaCleared = useCallback(() => {
    requestId.current++;
    setLoading(false);
    setResult(null);
    setAoiRing(null);
    setAppliedIndex(null);
  }, []);

  const hasArea = loading || result !== null;

  return (
    <main className="flex h-screen w-screen flex-col bg-deep">
      <TopNav />
      <div className="relative flex min-h-0 flex-1">
        <ControlPanel
          hasArea={hasArea}
          analysisLoading={loading}
          analysisResult={result}
          appliedIndex={appliedIndex}
          onApplyIndex={setAppliedIndex}
        />

        <div className="relative min-w-0 flex-1">
          <MapCanvas
            basemap={basemap}
            onAreaDrawn={handleAreaDrawn}
            onAreaCleared={handleAreaCleared}
            onCursorMove={setCursor}
          />
          <MapChrome
            hasArea={hasArea}
            basemap={basemap}
            onToggleBasemap={() => setBasemap((b) => (b === "dark" ? "satellite" : "dark"))}
          />
        </div>

        <ScenesPanel
          hasArea={hasArea}
          analysisLoading={loading}
          analysisResult={result}
          aoiRing={aoiRing}
        />
      </div>
    </main>
  );
}
