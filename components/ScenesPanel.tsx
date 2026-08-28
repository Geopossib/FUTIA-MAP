"use client";

import { useState } from "react";
import type { AnalysisResult, LngLat } from "@/lib/types";
import { downloadAoiGeoJson } from "@/lib/exportGeoJson";

type Props = {
  hasArea: boolean;
  analysisLoading: boolean;
  analysisResult: AnalysisResult | null;
  aoiRing: LngLat[] | null;
};

function SceneRow({ title, subtitle, loading }: { title: string; subtitle: string; loading?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-md border border-line bg-panel-raised/50 p-2 text-left transition-colors hover:border-line-bright"
    >
      <div
        className={`h-10 w-10 shrink-0 rounded bg-gradient-to-br from-signal-dim via-water-dim to-panel-raised ${
          loading ? "radar-sweep" : ""
        }`}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-text-primary">{title}</p>
        <p className="truncate text-[10px] text-text-muted">{subtitle}</p>
      </div>
    </button>
  );
}

export default function ScenesPanel({ hasArea, analysisLoading, analysisResult, aoiRing }: Props) {
  const [search, setSearch] = useState("");

  const scenes = analysisResult
    ? [
        { offset: 0, cloud: analysisResult.cloudCoverPct },
        { offset: 5, cloud: Math.min(30, analysisResult.cloudCoverPct + 6) },
        { offset: 11, cloud: Math.max(0, analysisResult.cloudCoverPct - 3) },
      ]
    : [];

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-panel px-4 py-4">
      <div>
        <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-text-primary">
          Search &amp; Area Selection
        </p>
        <div className="flex items-center gap-1.5">
          <input
            id="scene-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search area, or draw polygon…"
            className="w-full rounded-md border border-line bg-panel-raised px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
          />
          <button
            type="button"
            title="Draw area on map"
            onClick={() => document.getElementById("draw-area-trigger")?.click()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-text-muted transition-colors hover:border-line-bright hover:text-text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7.5 5.5-2.9 8.7H7.4L4.5 8.5 12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] font-medium text-text-muted">Available Scenes</p>
          {hasArea && <span className="text-[10px] text-text-muted">Find suitable image</span>}
        </div>

        {!hasArea && (
          <p className="rounded-md border border-dashed border-line px-3 py-4 text-center text-[11px] text-text-muted">
            Draw an area to see available scenes.
          </p>
        )}

        {hasArea && analysisLoading && (
          <div className="space-y-1.5">
            <SceneRow title="Searching…" subtitle="Querying catalog" loading />
            <SceneRow title="Searching…" subtitle="Querying catalog" loading />
          </div>
        )}

        {hasArea && !analysisLoading && analysisResult && (
          <div className="space-y-1.5">
            {scenes.map((s, i) => (
              <SceneRow
                key={i}
                title={`${analysisResult.areaName}${i > 0 ? ` (T-${s.offset}d)` : ""}`}
                subtitle={`Cloud ${s.cloud.toFixed(0)}% · Find suitable image`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-line bg-panel-raised/40 p-3">
        <div className="mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 3h6l1 4-4 3-4-3 1-4z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M8 10l-4 3 1 4h14l1-4-4-3" stroke="var(--water)" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <p className="font-display text-xs font-semibold text-text-primary">Python Automation</p>
        </div>
        <a
          href="https://jupyterhub.dataspace.copernicus.eu/"
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-md bg-gold py-2 text-center text-xs font-semibold text-[#241a03] transition-colors hover:brightness-110"
        >
          Launch JupyterLab
        </a>
        <p className="mt-1.5 text-[10px] text-text-muted">
          Opens CDSE&apos;s hosted JupyterHub for scripted Sentinel Hub /
          openEO access.
        </p>
      </div>

      <div className="rounded-md border border-line bg-panel-raised/40 p-3">
        <div className="mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="var(--signal)" strokeWidth="1.4" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="var(--water)" strokeWidth="1.4" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="var(--gold)" strokeWidth="1.4" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="var(--alert)" strokeWidth="1.4" />
          </svg>
          <p className="font-display text-xs font-semibold text-text-primary">QGIS Integration</p>
        </div>
        <button
          type="button"
          disabled={!hasArea || !aoiRing}
          onClick={() => aoiRing && analysisResult && downloadAoiGeoJson(aoiRing, analysisResult.areaName)}
          className="block w-full rounded-md bg-gold py-2 text-center text-xs font-semibold text-[#241a03] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Open in QGIS
        </button>
        <ul className="mt-1.5 space-y-0.5 text-[10px] text-text-muted">
          <li>• Exports the drawn AOI as GeoJSON.</li>
          <li>• Drag the file into QGIS to layer it over your own rasters.</li>
        </ul>
      </div>
    </aside>
  );
}
