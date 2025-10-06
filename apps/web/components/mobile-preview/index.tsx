import * as React from "react";

type MobilePreviewProps = React.PropsWithChildren & {
  /** Battery level for the tiny indicator: 0–100. Default: 78 */
  battery?: number;
  /** Extra classes for the outermost wrapper */
  className?: string;
  /** Apply a dark screen background (useful when previewing dark UIs) */
  dark?: boolean;
  /** Show the top notch cutout */
  showNotch?: boolean;
  /** Show a simple status bar overlay */
  showStatusBar?: boolean;
  /** Status bar time (string to avoid SSR hydration mismatch). Default: "9:41" */
  time?: string;
  /** Outer width of the device frame (px or any CSS width). Default: 360 */
  width?: number | string;
};

export function MobilePreview({
  battery = 78,
  children,
  className = "",
  dark = false,
  showNotch = true,
  showStatusBar = true,
  time = "9:41",
  width = 360,
}: MobilePreviewProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const batt = Math.max(0, Math.min(100, battery));

  return (
    <div className={`mx-auto ${className} min-w-80`} style={{ width: w }}>
      {/* Bezel */}
      <div className="relative rounded-[2.5rem] bg-neutral-900 p-2 shadow-2xl ring-1 ring-black/10">
        {/* Side buttons (decorative) */}
        <div
          aria-hidden
          className="absolute -left-[2px] top-20 h-16 w-[3px] rounded-r bg-neutral-800"
        />
        <div
          aria-hidden
          className="absolute -left-[2px] top-40 h-10 w-[3px] rounded-r bg-neutral-800"
        />
        <div
          aria-hidden
          className="absolute -right-[2px] top-28 h-20 w-[3px] rounded-l bg-neutral-800"
        />

        {/* Screen mask */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-neutral-900">
          {/* Notch */}
          {showNotch && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
              <div className="mt-2 h-6 w-24 rounded-full bg-neutral-900 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.45)]" />
            </div>
          )}

          {/* Status bar */}
          {showStatusBar && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-2 text-[11px] font-medium text-neutral-50">
              <span>{time}</span>
              <div className="flex items-center gap-1">
                <span
                  aria-label="signal"
                  className="h-3 w-3 rounded-full bg-neutral-200/90"
                />
                <span
                  aria-label="wifi"
                  className="h-3 w-3 rounded-full bg-neutral-200/90"
                />
                <div
                  aria-label={`battery ${batt}%`}
                  className="relative h-[10px] w-[22px] rounded-[3px] border border-neutral-200/80"
                >
                  <div className="absolute -right-1 top-1/2 h-[6px] w-[2px] -translate-y-1/2 rounded-r-sm bg-neutral-200/80" />
                  <div
                    className="h-full bg-neutral-200"
                    style={{ width: `${batt}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Screen (19.5:9-ish) */}
          <div
            className={`relative h-full w-full ${showNotch || showStatusBar ? "pt-8" : ""}`}
          >
            <div className="aspect-[9/19] overflow-hidden rounded-[1.6rem]">
              <div
                className={`h-full w-full overflow-y-auto overscroll-contain ${
                  dark
                    ? "bg-neutral-900 text-neutral-100"
                    : "bg-white text-neutral-900"
                }`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
