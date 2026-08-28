"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gdxei_onboarded_v1";

const steps = [
  {
    title: "1. Draw an area",
    body: "Use the pentagon tool on the map (or the search panel on the right) to outline a region in Nigeria.",
  },
  {
    title: "2. Apply an index",
    body: "Once a scene is found, choose NDVI (vegetation) or NDWI (water) in the left panel to see the area average.",
  },
  {
    title: "3. Check the timeline",
    body: "Expand the bar at the bottom of the map for a trend chart and before/after change detection.",
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing etc.) — skip onboarding silently
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="fade-in-up w-full max-w-sm rounded-lg border border-line-bright bg-panel p-5">
        <p className="font-data text-[10px] tracking-[0.18em] text-signal">GDX EARTH INTELLIGENCE</p>
        <h2 className="mt-1 font-display text-lg font-semibold text-text-primary">
          Quick start
        </h2>
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <div key={step.title}>
              <p className="text-xs font-semibold text-text-primary">{step.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{step.body}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-md bg-gold py-2 text-xs font-semibold text-[#241a03] transition-colors hover:brightness-110"
        >
          Got it, let&apos;s go
        </button>
      </div>
    </div>
  );
}
