"use client";

import type { AnalysisResult } from "@/lib/types";

type Props = {
  visible: boolean;
  loading: boolean;
  result: AnalysisResult | null;
};

function Meter({
  label,
  value,
  displayValue,
  color,
}: {
  label: string;
  value: number; // 0-100
  displayValue: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="font-data text-xs text-text-primary">{displayValue}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(2, value))}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function TelemetryPanel({ visible, loading, result }: Props) {
  return (
    <aside
      className={`pointer-events-auto absolute top-0 right-0 z-20 h-full w-[300px] border-l border-line bg-panel/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-4 py-3">
          <p className="font-data text-[10px] tracking-[0.18em] text-signal">
            AOI TELEMETRY
          </p>
          <h2 className="font-display text-base font-semibold text-text-primary">
            {loading ? "Analyzing area…" : result?.areaName ?? "No area selected"}
          </h2>
        </div>

        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="radar-sweep h-16 w-16 rounded-full border border-line-bright" />
            <p className="font-data text-[11px] text-text-muted">
              QUERYING SENTINEL-2 · FILTERING CLOUD COVER
            </p>
          </div>
        )}

        {!loading && result && (
          <div className="fade-in-up flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-line bg-panel-raised/60 px-3 py-2">
                <p className="text-[10px] text-text-muted">AREA</p>
                <p className="font-data text-sm text-text-primary">{result.areaKm2} km²</p>
              </div>
              <div className="rounded-md border border-line bg-panel-raised/60 px-3 py-2">
                <p className="text-[10px] text-text-muted">IMAGE DATE</p>
                <p className="font-data text-sm text-text-primary">{result.imageDate}</p>
              </div>
              <div className="rounded-md border border-line bg-panel-raised/60 px-3 py-2">
                <p className="text-[10px] text-text-muted">CLOUD COVER</p>
                <p className="font-data text-sm text-text-primary">{result.cloudCoverPct}%</p>
              </div>
              <div className="rounded-md border border-line bg-panel-raised/60 px-3 py-2">
                <p className="text-[10px] text-text-muted">CHANGE (30D)</p>
                <p
                  className="font-data text-sm"
                  style={{ color: result.changeSinceLastPct >= 0 ? "#22e0a3" : "#ff9d4d" }}
                >
                  {result.changeSinceLastPct >= 0 ? "+" : ""}
                  {result.changeSinceLastPct}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Meter
                label="NDVI · vegetation health"
                value={(result.ndvi + 1) * 50}
                displayValue={result.ndvi.toFixed(2)}
                color="#22e0a3"
              />
              <Meter
                label="NDWI · water content"
                value={(result.ndwi + 1) * 50}
                displayValue={result.ndwi.toFixed(2)}
                color="#4da3ff"
              />
              <Meter
                label="Flood extent"
                value={result.floodExtentPct}
                displayValue={`${result.floodExtentPct}%`}
                color="#ff9d4d"
              />
              <Meter
                label="Built-up area"
                value={result.builtUpPct}
                displayValue={`${result.builtUpPct}%`}
                color="#c9a874"
              />
            </div>

            <div className="rounded-md border border-line bg-panel-raised/40 px-3 py-2.5">
              <p className="text-[10px] text-text-muted">CENTROID</p>
              <p className="font-data text-xs text-text-primary">
                {result.centroid.lat.toFixed(4)}, {result.centroid.lng.toFixed(4)}
              </p>
            </div>

            <button
              type="button"
              className="w-full rounded-md border border-signal-dim bg-signal-dim/20 px-3 py-2 text-xs font-medium text-signal transition-colors hover:bg-signal-dim/35"
            >
              Download report (PDF)
            </button>
            <p className="text-center text-[10px] text-text-muted">
              Figures are placeholder values. Live analysis connects once
              Copernicus Data Space Ecosystem API access is configured.
            </p>
          </div>
        )}

        {!loading && !result && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-xs text-text-muted">
              Use &ldquo;Draw area&rdquo; and outline a region on the map to
              generate a telemetry readout.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
