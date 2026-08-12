"use client";

import type { LngLat } from "@/lib/types";

type Props = {
  cursor: LngLat | null;
  hasArea: boolean;
};

function formatCoord(value: number) {
  return (value >= 0 ? "+" : "") + value.toFixed(4);
}

export default function HudOverlay({ cursor, hasArea }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Brand block */}
      <div className="pointer-events-auto absolute top-4 left-4 max-w-[220px] rounded-lg border border-line bg-panel/85 px-4 py-3 backdrop-blur-sm">
        <p className="font-data text-[10px] tracking-[0.18em] text-signal">
          GDX EARTH INTELLIGENCE
        </p>
        <h1 className="mt-1 font-display text-lg font-semibold leading-tight text-text-primary">
          Nigeria Flood &amp; Land-Change Monitor
        </h1>
        <p className="mt-1.5 text-xs leading-snug text-text-muted">
          Draw an area of interest to pull vegetation, water, and flood
          indicators from Sentinel-1/2.
        </p>
      </div>

      {/* Draw / clear toolbar */}
      <div className="pointer-events-auto absolute top-[132px] left-4 flex flex-col gap-1 rounded-lg border border-line bg-panel/85 p-1 backdrop-blur-sm">
        <button
          id="draw-area-trigger"
          type="button"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-text-primary transition-colors hover:bg-panel-raised"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M4 6L12 3L20 6V18L12 21L4 18V6Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M4 6L12 9L20 6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 9V21" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Draw area
        </button>
        <button
          id="clear-area-trigger"
          type="button"
          disabled={!hasArea}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-text-muted transition-colors hover:bg-panel-raised hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M4 7H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M6 7L7 20H17L18 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10 11V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14 11V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M9 7L10 4H14L15 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          Clear
        </button>
      </div>

      {/* Live cursor coordinate readout — signature detail tying the UI
          back to a satellite targeting/telemetry feel. */}
      <div className="pointer-events-none absolute bottom-6 left-4 rounded-md border border-line bg-panel/85 px-3 py-1.5 font-data text-[11px] text-text-muted backdrop-blur-sm">
        {cursor ? (
          <span>
            LAT <span className="text-signal">{formatCoord(cursor.lat)}</span>{"  "}
            LNG <span className="text-signal">{formatCoord(cursor.lng)}</span>
          </span>
        ) : (
          <span>LAT ---.---- &nbsp; LNG ---.----</span>
        )}
      </div>

      {/* Status pill */}
      <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-line bg-panel/85 px-3 py-1.5 backdrop-blur-sm">
        <span className="pulse-ring h-1.5 w-1.5 rounded-full bg-alert" />
        <span className="font-data text-[10px] tracking-wide text-text-muted">
          MOCK DATA · SENTINEL-1/2 PENDING
        </span>
      </div>
    </div>
  );
}
