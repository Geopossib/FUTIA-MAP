"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import TopNav from "@/components/TopNav";
import ControlPanel from "@/components/ControlPanel";
import ScenesPanel from "@/components/ScenesPanel";
import MapChrome from "@/components/MapChrome";
import TimeSeriesPanel from "@/components/TimeSeriesPanel";
import ErrorBanner from "@/components/ErrorBanner";
import ReportPrintView from "@/components/ReportPrintView";
import OnboardingTour from "@/components/OnboardingTour";
import type { BasemapId } from "@/components/MapCanvas";
import type { AnalysisResult, LngLat, TimeSeriesPoint } from "@/lib/types";
import { runMockAnalysis } from "@/lib/mockAnalysis";
import { runMockTimeSeries } from "@/lib/mockTimeSeries";

// MapLibre touches `window` on import, so the canvas must never render
// during SSR.
const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
});

type DrawParams = { centroid: LngLat; areaKm2: number; ring: LngLat[] };

export default function Home() {
  const [, setCursor] = useState<LngLat | null>(null);
  const [basemap, setBasemap] = useState<BasemapId>("dark");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [series, setSeries] = useState<TimeSeriesPoint[] | null>(null);
  const [aoiRing, setAoiRing] = useState<LngLat[] | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<"ndvi" | "ndwi" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const requestId = useRef(0);
  const lastDraw = useRef<DrawParams | null>(null);

  const runAnalysis = useCallback(async (params: DrawParams) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setResult(null);
    setSeries(null);
    setAppliedIndex(null);
    setError(null);

    try {
      // Simulated failure so the error/retry path is real and testable
      // before it's wired to a real, occasionally-flaky upstream API.
      if (Math.random() < 0.12) {
        throw new Error("Scene catalog request timed out.");
      }
      const [analysis, timeSeries] = await Promise.all([
        runMockAnalysis(params.centroid, params.areaKm2),
        runMockTimeSeries(params.centroid, params.areaKm2),
      ]);
      if (requestId.current === thisRequest) {
        setResult(analysis);
        setSeries(timeSeries);
        setLoading(false);
      }
    } catch (e) {
      if (requestId.current === thisRequest) {
        setError(e instanceof Error ? e.message : "Analysis failed.");
        setLoading(false);
      }
    }
  }, []);

  const handleAreaDrawn = useCallback(
    (centroid: LngLat, areaKm2: number, ring: LngLat[]) => {
      const params = { centroid, areaKm2, ring };
      lastDraw.current = params;
      setAoiRing(ring);
      runAnalysis(params);
    },
    [runAnalysis]
  );

  const handleAreaCleared = useCallback(() => {
    requestId.current++;
    lastDraw.current = null;
    setLoading(false);
    setResult(null);
    setSeries(null);
    setAoiRing(null);
    setAppliedIndex(null);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (lastDraw.current) runAnalysis(lastDraw.current);
  }, [runAnalysis]);

  const hasArea = loading || result !== null || error !== null;

  return (
    <main className="flex h-screen w-screen flex-col bg-deep">
      <OnboardingTour />
      <ReportPrintView result={result} series={series} />

      <TopNav
        onToggleControls={() => setLeftOpen((v) => !v)}
        onToggleScenes={() => setRightOpen((v) => !v)}
      />

      <div className="relative flex min-h-0 flex-1 print:hidden">
        {/* Mobile backdrop for either drawer */}
        {(leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-40 mt-14 transition-transform duration-300 lg:static lg:z-auto lg:mt-0 lg:translate-x-0 ${
            leftOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ControlPanel
            hasArea={hasArea}
            analysisLoading={loading}
            analysisResult={result}
            appliedIndex={appliedIndex}
            onApplyIndex={setAppliedIndex}
          />
        </div>

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
          <TimeSeriesPanel visible={hasArea && !error} loading={loading} series={series} />
          {error && (
            <ErrorBanner message={error} onRetry={handleRetry} onDismiss={() => setError(null)} />
          )}
        </div>

        <div
          className={`fixed inset-y-0 right-0 z-40 mt-14 transition-transform duration-300 lg:static lg:z-auto lg:mt-0 lg:translate-x-0 ${
            rightOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ScenesPanel
            hasArea={hasArea}
            analysisLoading={loading}
            analysisResult={result}
            aoiRing={aoiRing}
            onDownloadReport={() => window.print()}
          />
        </div>
      </div>
    </main>
  );
}
