"use client";

type Props = {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
};

export default function ErrorBanner({ message, onRetry, onDismiss }: Props) {
  return (
    <div className="pointer-events-auto absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-3 rounded-md border border-alert/50 bg-panel/95 px-4 py-2 shadow-lg backdrop-blur-md">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-alert">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
      <p className="text-xs text-text-primary">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-line-bright px-2.5 py-1 text-[11px] font-medium text-text-primary transition-colors hover:bg-panel-raised"
      >
        Retry
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-text-muted transition-colors hover:text-text-primary"
        title="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
