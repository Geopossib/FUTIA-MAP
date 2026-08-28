"use client";

import type { AnalysisResult, TimeSeriesPoint } from "@/lib/types";

type Props = {
  result: AnalysisResult | null;
  series: TimeSeriesPoint[] | null;
};

export default function ReportPrintView({ result, series }: Props) {
  if (!result) return null;

  return (
    <div id="print-root" className="hidden print:block print:p-10">
      <h1 className="text-2xl font-bold text-black">GDX Earth Intelligence — AOI Report</h1>
      <p className="mt-1 text-sm text-black">{result.areaName}</p>
      <p className="text-xs text-neutral-600">
        Generated {new Date().toISOString().slice(0, 10)} · Image date {result.imageDate}
      </p>

      <table className="mt-6 w-full border-collapse text-sm text-black">
        <tbody>
          {[
            ["Area", `${result.areaKm2} km²`],
            ["Centroid", `${result.centroid.lat.toFixed(4)}, ${result.centroid.lng.toFixed(4)}`],
            ["Cloud cover", `${result.cloudCoverPct}%`],
            ["NDVI (vegetation)", result.ndvi.toFixed(2)],
            ["NDWI (water)", result.ndwi.toFixed(2)],
            ["Flood extent", `${result.floodExtentPct}%`],
            ["Built-up area", `${result.builtUpPct}%`],
            ["Change since last (30d)", `${result.changeSinceLastPct}%`],
          ].map(([label, value]) => (
            <tr key={label} className="border-b border-neutral-300">
              <td className="py-1.5 pr-4 font-medium">{label}</td>
              <td className="py-1.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {series && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-black">Timeline</h2>
          <table className="mt-2 w-full border-collapse text-xs text-black">
            <thead>
              <tr className="border-b border-neutral-400 text-left">
                <th className="py-1 pr-4">Date</th>
                <th className="py-1 pr-4">NDVI</th>
                <th className="py-1 pr-4">NDWI</th>
                <th className="py-1">Flood %</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.date} className="border-b border-neutral-200">
                  <td className="py-1 pr-4">{p.date}</td>
                  <td className="py-1 pr-4">{p.ndvi.toFixed(2)}</td>
                  <td className="py-1 pr-4">{p.ndwi.toFixed(2)}</td>
                  <td className="py-1">{p.floodExtentPct.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-[10px] text-neutral-500">
        Figures are simulated pending live Copernicus Data Space Ecosystem
        integration. GDX Earth Intelligence · GDX Tech Co. Ltd.
      </p>
    </div>
  );
}
