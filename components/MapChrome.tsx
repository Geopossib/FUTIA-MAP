"use client";

import type { BasemapId } from "@/components/MapCanvas";

type Props = {
  hasArea: boolean;
  basemap: BasemapId;
  onToggleBasemap: () => void;
};

function IconButton({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
        active
          ? "border-signal bg-signal/15 text-signal"
          : "border-line bg-panel text-text-muted hover:border-line-bright hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export default function MapChrome({ hasArea, basemap, onToggleBasemap }: Props) {
  return (
    <>
      {/* Top-right: search / layers / info — mirrors the mockup's small
          square icon buttons above the map */}
      <div className="pointer-events-auto absolute top-3 right-3 z-10 flex gap-2">
        <IconButton
          title="Jump to area search"
          onClick={() => document.getElementById("scene-search-input")?.focus()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </IconButton>
        <IconButton title="Toggle satellite / dark basemap" onClick={onToggleBasemap} active={basemap === "satellite"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L2 9l10 6 10-6-10-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M2 15l10 6 10-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M2 12l10 6 10-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </IconButton>
        <IconButton title="This map shows simulated indicators — connect CDSE credentials for live Sentinel data">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </svg>
        </IconButton>
      </div>

      {/* Side draw toolbar */}
      <div className="pointer-events-auto absolute top-16 right-3 z-10 flex flex-col gap-2">
        <IconButton title="Draw area of interest" onClick={() => document.getElementById("draw-area-trigger")?.click()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7.5 5.5-2.9 8.7H7.4L4.5 8.5 12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </IconButton>
        <IconButton title="Locate me" onClick={() => document.getElementById("locate-trigger")?.click()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </IconButton>
        <IconButton
          title={hasArea ? "Clear drawn area" : "Draw an area first"}
          onClick={() => document.getElementById("clear-area-trigger")?.click()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M6 7l1 13h10l1-13M9.5 7l.5-3h4l.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </div>
    </>
  );
}
