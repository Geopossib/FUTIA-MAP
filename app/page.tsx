"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import HudOverlay from "@/components/HudOverlay";
import TelemetryPanel from "@/components/TelemetryPanel";
import type { AnalysisResult, LngLat } from "@/lib/types";
import { runMockAnalysis } from "@/lib/mockAnalysis";

// MapLibre touches `window` on import, so the canvas must never render
// during SSR.
const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
});

export default function Home() {
  const [cursor, setCursor] = useState<LngLat | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const requestId = useRef(0);

  const handleAreaDrawn = useCallback(async (centroid: LngLat, areaKm2: number) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setResult(null);
    const analysis = await runMockAnalysis(centroid, areaKm2);
    if (requestId.current === thisRequest) {
      setResult(analysis);
      setLoading(false);
    }
  }, []);

  const handleAreaCleared = useCallback(() => {
    requestId.current++;
    setLoading(false);
    setResult(null);
  }, []);

  return (
    <main className="relative h-screen w-screen bg-deep">
      <MapCanvas
        onAreaDrawn={handleAreaDrawn}
        onAreaCleared={handleAreaCleared}
        onCursorMove={setCursor}
      />
      <HudOverlay cursor={cursor} hasArea={loading || result !== null} />
      <TelemetryPanel visible={loading || result !== null} loading={loading} result={result} />
    </main>
  );
}
