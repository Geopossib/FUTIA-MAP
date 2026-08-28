"use client";

import { useState } from "react";

const navItems: { label: string; hasDropdown?: boolean }[] = [
  { label: "Home" },
  { label: "Projects", hasDropdown: true },
  { label: "Resources", hasDropdown: true },
  { label: "Community", hasDropdown: true },
];

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="ml-1">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopNav() {
  const [active, setActive] = useState("Home");

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-4">
      <div className="flex items-center gap-2">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-signal to-water">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12a9 9 0 1018 0 9 9 0 00-18 0zM3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z"
              stroke="#0a0f1a"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold tracking-tight text-text-primary">
            GDX-EI
          </p>
          <p className="-mt-0.5 text-[10px] text-text-muted">Earth Intelligence</p>
        </div>
      </div>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActive(item.label)}
            className={`flex items-center text-sm font-medium transition-colors ${
              active === item.label
                ? "text-signal"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown />}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden rounded-md border border-line px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-line-bright hover:text-text-primary sm:block"
        >
          API Docs
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-line-bright"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-7 8-7s8 3 8 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Login
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-[#241a03] transition-colors hover:brightness-110"
        >
          Start Project
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
