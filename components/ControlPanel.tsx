"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

type Props = {
  hasArea: boolean;
  analysisLoading: boolean;
  analysisResult: AnalysisResult | null;
  appliedIndex: "ndvi" | "ndwi" | null;
  onApplyIndex: (index: "ndvi" | "ndwi") => void;
};

type Band = { id: string; label: string; use: string };

const BANDS: Band[] = [
  { id: "B02", label: "B02 · Blue (10m)", use: "Atmosphere / water" },
  { id: "B03", label: "B03 · Green (10m)", use: "Vegetation / water" },
  { id: "B04", label: "B04 · Red (10m)", use: "Vegetation" },
  { id: "B08", label: "B08 · NIR (10m)", use: "Vegetation" },
];

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-panel-raised px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-signal"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ControlPanel({
  hasArea,
  analysisLoading,
  analysisResult,
  appliedIndex,
  onApplyIndex,
}: Props) {
  const [platform, setPlatform] = useState("Sentinel-2");
  const [sensorType, setSensorType] = useState("Level-2A");
  const [dateFrom, setDateFrom] = useState("2026-08-01");
  const [dateTo, setDateTo] = useState("2026-08-28");
  const [cloudCover, setCloudCover] = useState(20);
  const [selectedBands, setSelectedBands] = useState<Set<string>>(new Set(["B02"]));
  const [hoveredBand, setHoveredBand] = useState<string | null>(null);

  const sensorOptions =
    platform === "Sentinel-2"
      ? ["Level-2A", "Level-1C"]
      : platform === "Sentinel-1"
      ? ["GRD", "SLC"]
      : ["Collection 2 Level-2"];

  function toggleBand(id: string) {
    setSelectedBands((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-panel px-4 py-4">
      <div>
        <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-text-primary">
          Select Platform
        </p>
        <Select
          label="Platform"
          value={platform}
          onChange={(v) => {
            setPlatform(v);
            setSensorType(v === "Sentinel-2" ? "Level-2A" : v === "Sentinel-1" ? "GRD" : "Collection 2 Level-2");
          }}
          options={["Sentinel-2", "Sentinel-1", "Landsat 8/9"]}
        />
      </div>

      <Select label="Sensor Type" value={sensorType} onChange={setSensorType} options={sensorOptions} />

      <div>
        <label className="mb-1 block text-[11px] font-medium text-text-muted">Date Range</label>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-md border border-line bg-panel-raised px-2 py-1.5 text-[11px] text-text-primary outline-none focus:border-signal"
          />
          <span className="text-text-muted">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-md border border-line bg-panel-raised px-2 py-1.5 text-[11px] text-text-primary outline-none focus:border-signal"
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-[11px] font-medium text-text-muted">Cloud Cover Limit</label>
          <span className="font-data text-[11px] text-signal">&lt;{cloudCover}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          value={cloudCover}
          onChange={(e) => setCloudCover(Number(e.target.value))}
          className="w-full accent-[#22e0a3]"
        />
        <div className="flex justify-between text-[9px] text-text-muted">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-text-muted">Band Selection Tool</p>
        <div className="space-y-1.5">
          {BANDS.map((band) => (
            <div key={band.id} className="relative">
              <label
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-xs text-text-primary hover:bg-panel-raised"
                onMouseEnter={() => setHoveredBand(band.id)}
                onMouseLeave={() => setHoveredBand(null)}
              >
                <input
                  type="checkbox"
                  checked={selectedBands.has(band.id)}
                  onChange={() => toggleBand(band.id)}
                  className="h-3.5 w-3.5 accent-[#22e0a3]"
                />
                {band.label}
              </label>
              {hoveredBand === band.id && (
                <div className="absolute left-6 top-full z-20 mt-1 w-48 rounded-md border border-line-bright bg-panel-raised p-2.5 shadow-lg">
                  <p className="mb-1 text-[10px] font-semibold text-text-muted">Common use</p>
                  <p className="text-[11px] text-text-primary">{band.use}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-text-muted">Apply Index</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasArea}
            onClick={() => onApplyIndex("ndvi")}
            className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              appliedIndex === "ndvi"
                ? "border-signal bg-signal/15 text-signal"
                : "border-line text-text-muted hover:border-line-bright hover:text-text-primary"
            }`}
          >
            NDVI
          </button>
          <button
            type="button"
            disabled={!hasArea}
            onClick={() => onApplyIndex("ndwi")}
            className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              appliedIndex === "ndwi"
                ? "border-water bg-water/15 text-water"
                : "border-line text-text-muted hover:border-line-bright hover:text-text-primary"
            }`}
          >
            NDWI
          </button>
        </div>

        {!hasArea && (
          <p className="mt-2 text-[11px] text-text-muted">
            Draw an area on the map to apply an index.
          </p>
        )}

        {hasArea && appliedIndex && (
          <div className="fade-in-up mt-3 rounded-md border border-line bg-panel-raised/60 p-2.5">
            <p className="font-data text-[11px] text-text-primary">
              {appliedIndex === "ndvi"
                ? "NDVI = (B08–B04)/(B08+B04)"
                : "NDWI = (B03–B08)/(B03+B08)"}
            </p>
            <p className="mt-1.5 text-[10px] text-text-muted">Uses:</p>
            <ul className="mt-0.5 list-disc pl-4 text-[11px] text-text-primary">
              <li>{appliedIndex === "ndvi" ? "B08 NIR (10m) — Vegetation" : "B03 Green (10m) — Water content"}</li>
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2">
              <span className="text-[10px] text-text-muted">
                {analysisLoading ? "Computing…" : "Area average"}
              </span>
              <span className="font-data text-sm text-signal">
                {analysisLoading
                  ? "…"
                  : analysisResult
                  ? (appliedIndex === "ndvi" ? analysisResult.ndvi : analysisResult.ndwi).toFixed(2)
                  : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
