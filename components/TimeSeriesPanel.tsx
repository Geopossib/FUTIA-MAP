"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";

type Props = {
  visible: boolean;
  loading: boolean;
  series: TimeSeriesPoint[] | null;
};

function DeltaCard({
  label,
  before,
  after,
  unit = "",
}: {
  label: string;
  before: number;
  after: number;
  unit?: string;
}) {
  const delta = after - before;
  const positive = delta >= 0;
  return (
    <div className="rounded-md border border-line bg-panel-raised/60 px-3 py-2">
      <p className="text-[10px] text-text-muted">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-data text-sm text-text-primary">
          {before.toFixed(2)}
          {unit}
        </span>
        <span className="text-text-muted">→</span>
        <span className="font-data text-sm text-text-primary">
          {after.toFixed(2)}
          {unit}
        </span>
      </div>
      <p
        className="mt-0.5 font-data text-[11px]"
        style={{ color: positive ? "#22e0a3" : "#ff9d4d" }}
      >
        {positive ? "+" : ""}
        {delta.toFixed(2)}
        {unit}
      </p>
    </div>
  );
}

export default function TimeSeriesPanel({ visible, loading, series }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const first = series?.[0];
  const last = series?.[series.length - 1];

  return (
    <div
      className={`pointer-events-auto absolute inset-x-3 bottom-3 z-10 rounded-lg border border-line bg-panel/95 backdrop-blur-md transition-[height] duration-300 ${
        expanded ? "h-64" : "h-9"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex h-9 w-full items-center justify-between px-3 text-left"
      >
        <span className="font-data text-[11px] tracking-wide text-text-muted">
          {loading ? "BUILDING TIMELINE…" : "TIMELINE & CHANGE DETECTION"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="fade-in-up flex h-[calc(100%-2.25rem)] gap-4 overflow-hidden px-3 pb-3">
          <div className="min-w-0 flex-1">
            {loading || !series ? (
              <div className="flex h-full items-center justify-center">
                <div className="radar-sweep h-10 w-10 rounded-full border border-line-bright" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#22304d" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#8593ad"
                    fontSize={10}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis stroke="#8593ad" fontSize={10} domain={[-0.2, 1]} />
                  <Tooltip
                    contentStyle={{
                      background: "#16213a",
                      border: "1px solid #35486e",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#eef2f9" }}
                  />
                  <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#22e0a3" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="ndwi" name="NDWI" stroke="#4da3ff" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {!loading && first && last && (
            <div className="flex w-44 shrink-0 flex-col justify-center gap-2">
              <p className="text-[10px] font-medium text-text-muted">
                Change over {series?.length ?? 0} captures
              </p>
              <DeltaCard label="NDVI (vegetation)" before={first.ndvi} after={last.ndvi} />
              <DeltaCard label="NDWI (water)" before={first.ndwi} after={last.ndwi} />
              <DeltaCard
                label="Flood extent"
                before={first.floodExtentPct}
                after={last.floodExtentPct}
                unit="%"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
