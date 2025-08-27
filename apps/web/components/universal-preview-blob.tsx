/* eslint-disable @typescript-eslint/no-explicit-any */
// /components/universal-preview-blob.tsx
"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import clsx from "clsx";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useObjectURL } from "@/hooks/use-object-url";
import { usePanZoom } from "@/hooks/use-pan-zoom";

export type UniversalPreviewBlobProps = {
  allowDownload?: boolean;
  "aria-label"?: string;
  className?: string;
  imgProps?: React.ComponentProps<"img">;
  initialScale?: number;
  modalOnClick?: boolean;
  onError?: (err: unknown) => void;
  src: string;
  videoProps?: React.ComponentProps<"video">;
};

type FetchedMeta = {
  blob: Blob;
  filename?: string;
  mime: string;
  size?: number;
};

const LARGE_SIZE = 100 * 1024 * 1024; // 100MB

export function UniversalPreviewBlob({
  allowDownload = true,
  "aria-label": ariaLabel,
  className,
  imgProps,
  initialScale = 1,
  modalOnClick = true,
  onError,
  src,
  videoProps,
}: UniversalPreviewBlobProps) {
  const [meta, setMeta] = useState<FetchedMeta | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [warnLarge, setWarnLarge] = useState(false);
  const [open, setOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const url = useObjectURL(meta?.blob ?? null);

  // Type deduction
  const mime = meta?.mime ?? "application/octet-stream";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");

  // Fetch on mount/src change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setWarnLarge(false);
    setMeta(null);

    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const res = await fetch(src, {
          cache: "no-store",
          signal: ac.signal as AbortSignal,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Request failed: ${res.status} ${res.statusText} ${text ? "- " + text : ""}`
          );
        }

        const ct =
          res.headers.get("Content-Type") || "application/octet-stream";
        const cd = res.headers.get("Content-Disposition") || "";
        const cl = res.headers.get("Content-Length");
        const size = cl ? Number(cl) : undefined;

        if (size && size > LARGE_SIZE) {
          setWarnLarge(true);
        }

        // parse filename
        const filename =
          parseContentDispositionFilename(cd) || guessFilenameFromType(ct);

        const blob = await res.blob();
        const mime = blob.type || ct || "application/octet-stream";

        if (!mounted) return;
        setMeta({ blob, filename, mime, size });
        setLoading(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        if (mounted) {
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e);
          setLoading(false);
          onError?.(e);
        }
      }
    })();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [src, onError]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRetry = () => {
    // changing src refires effect; trigger by toggling query param (cache is no-store anyway)
    // Simpler: just re-run by setting state to initial; use a dummy param to force rerun
    setMeta(null);
    setError(null);
    setLoading(true);
    // Re-run fetch effect by updating a no-op state? We'll just call again via effect by using a tiny timeout.
    // But effect depends on src only; to retry, we can just run the same logic:
    // Easiest UX: reload the same component by toggling a key at parent. For now, simulate by calling again:
    // We'll abort and then start a new fetch cycle:
    abortRef.current?.abort();
    // Let the effect re-run naturally by scheduling a microtask that sets state; but it won't re-run without dep change.
    // Workaround: use a unique cache-busting param on fly.
    const u = new URL(
      src,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );
    u.searchParams.set("_r", Math.random().toString(36).slice(2));
    // Trigger fetch by creating a temporary child request:
    // Instead, simpler: just use location.href fetch; but we must keep SSR hygiene.
    // We'll store a local state "bust" and include it in dependency chain.
  };

  // We’ll render Retry as a simple <a> reload for now to keep logic minimal:
  const retryHref = useMemo(() => {
    try {
      const u = new URL(
        src,
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost"
      );
      u.searchParams.set("_r", Math.random().toString(36).slice(2));
      return u.pathname + u.search;
    } catch {
      return src;
    }
  }, [src]);

  // Inline toolbar actions
  const doDownload = () => {
    if (!url || !allowDownload) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = meta?.filename || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Modal pan/zoom
  const { containerRef, contentRef, handlers, reset, zoomBy } = usePanZoom({
    initialScale,
    maxScale: 5,
    minScale: 1,
  });

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    const d = document as any;
    const isFull =
      d.fullscreenElement === el ||
      d.webkitFullscreenElement === el ||
      d.mozFullScreenElement === el ||
      d.msFullscreenElement === el;

    try {
      if (!isFull) {
        await (el.requestFullscreen?.() ||
          (el as any).webkitRequestFullscreen?.() ||
          (el as any).mozRequestFullScreen?.() ||
          (el as any).msRequestFullscreen?.());
      } else {
        await (document.exitFullscreen?.() ||
          (d as any).webkitExitFullscreen?.() ||
          (d as any).mozCancelFullScreen?.() ||
          (d as any).msExitFullscreen?.());
      }
    } catch {
      // ignore
    }
  };

  const inlineFrameClasses =
    "relative group isolate overflow-hidden rounded-2xl border bg-muted/30 shadow-sm";

  const toolbarBtn =
    "h-8 px-3 rounded-full border bg-background text-sm shadow hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const showUnsupported = !isImage && !isVideo;

  return (
    <TooltipProvider>
      <div className={clsx("w-full", className)}>
        {/* Large warning */}
        {warnLarge && (
          <Alert className="mb-3">
            <AlertTitle>Large file</AlertTitle>
            <AlertDescription>
              This file appears to be over 100 MB. Loading may be slow. Consider
              enabling range streaming on the API for large videos.
            </AlertDescription>
          </Alert>
        )}

        {/* Error state */}
        {error && (
          <Alert className="mb-3" variant="destructive">
            <AlertTitle>Failed to load</AlertTitle>
            <AlertDescription className="flex items-center gap-3">
              {error.message}
              <a className="ml-auto" href={retryHref}>
                <Button size="sm" variant="secondary">
                  Retry
                </Button>
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div
            aria-busy="true"
            aria-live="polite"
            className={inlineFrameClasses}
          >
            <AspectRatio ratio={16 / 9}>
              <Skeleton className="h-full w-full" />
            </AspectRatio>
          </div>
        )}

        {/* Unsupported fallback */}
        {!loading && !error && meta && showUnsupported && (
          <div className={clsx(inlineFrameClasses, "p-4")}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Preview not supported</p>
                <p className="text-xs text-muted-foreground">{mime}</p>
              </div>
              {allowDownload && url && (
                <Button onClick={doDownload} size="sm">
                  Download
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Image inline */}
        {!loading && !error && meta && isImage && url && (
          <div
            aria-label={ariaLabel ?? "Open zoom viewer"}
            className={inlineFrameClasses}
            onClick={() => modalOnClick && setOpen(true)}
            onKeyDown={(e) => {
              if (!modalOnClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            role={modalOnClick ? "button" : undefined}
            tabIndex={modalOnClick ? 0 : -1}
          >
            <AspectRatio ratio={16 / 9}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={imgProps?.alt ?? meta.filename ?? "preview"}
                className="h-full w-full object-contain select-none"
                draggable={false}
                src={url}
                {...imgProps}
              />
            </AspectRatio>

            {/* Hover toolbar */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {modalOnClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={toolbarBtn + " pointer-events-auto"}
                      type="button"
                    >
                      Zoom
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Open zoom viewer</TooltipContent>
                </Tooltip>
              )}
              {allowDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={toolbarBtn + " pointer-events-auto"}
                      onClick={(e) => {
                        e.stopPropagation();
                        doDownload();
                      }}
                      type="button"
                    >
                      Download
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Save file</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Video inline */}
        {!loading && !error && meta && isVideo && url && (
          <div
            aria-label={ariaLabel ?? "Open zoom viewer"}
            className={inlineFrameClasses}
            onClick={() => modalOnClick && setOpen(true)}
            onKeyDown={(e) => {
              if (!modalOnClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            role={modalOnClick ? "button" : undefined}
            tabIndex={modalOnClick ? 0 : -1}
          >
            <AspectRatio ratio={16 / 9}>
              <video
                className="h-full w-full rounded-2xl object-contain"
                controls
                muted={videoProps?.muted}
                playsInline
                preload={videoProps?.preload ?? "metadata"}
                ref={videoRef}
                src={url}
                {...videoProps}
                onClick={(e) => {
                  // prevent click-to-zoom from firing when user interacts with controls area
                  if ((e.target as HTMLElement).closest("video")) {
                    e.stopPropagation();
                  }
                }}
              />
            </AspectRatio>

            {/* Hover toolbar */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {modalOnClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={toolbarBtn + " pointer-events-auto"}
                      type="button"
                    >
                      Zoom
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Open zoom viewer</TooltipContent>
                </Tooltip>
              )}
              {allowDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={toolbarBtn + " pointer-events-auto"}
                      onClick={(e) => {
                        e.stopPropagation();
                        doDownload();
                      }}
                      type="button"
                    >
                      Download
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Save file</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Zoom Viewer (Dialog) */}
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogHeader className="sr-only">
            <DialogTitle>Zoom viewer</DialogTitle>
            <DialogDescription>Pan and zoom media</DialogDescription>
          </DialogHeader>
          <DialogContent className="min-w-[96vw] p-0 sm:p-0 flex flex-col items-center">
            {/* Toolbar */}
            <div className="flex items-center justify-end gap-2 p-2 sm:p-3">
              <Button onClick={() => zoomBy(1.1)} size="sm" variant="secondary">
                +
              </Button>
              <Button
                onClick={() => zoomBy(1 / 1.1)}
                size="sm"
                variant="secondary"
              >
                -
              </Button>
              <Button onClick={reset} size="sm" variant="secondary">
                Reset
              </Button>
              <Button onClick={toggleFullscreen} size="sm" variant="secondary">
                Fullscreen
              </Button>
              {allowDownload && url && (
                <Button onClick={doDownload} size="sm">
                  Download
                </Button>
              )}
              <Button
                onClick={() => setOpen(false)}
                size="sm"
                variant="outline"
              >
                Close
              </Button>
            </div>

            {/* Interactive canvas */}
            <div
              className="relative h-[80vh] w-[96vw] touch-pan-y overflow-hidden bg-black/90 outline-none sm:rounded-b-2xl"
              ref={containerRef}
              tabIndex={0}
              {...handlers}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
                ref={contentRef}
                style={{ transformOrigin: "0 0" }}
              >
                {isImage && url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={imgProps?.alt ?? meta?.filename ?? "zoomed image"}
                    className="pointer-events-none select-none max-h-[80vh] max-w-[96vw]"
                    draggable={false}
                    src={url}
                  />
                )}
                {isVideo && url && (
                  <video
                    className="pointer-events-none select-none max-h-[80vh] max-w-[96vw] rounded-lg"
                    controls={false}
                    muted
                    playsInline
                    preload="metadata"
                    src={url}
                  />
                )}
              </div>
            </div>

            <div className="p-2 text-center text-xs text-muted-foreground">
              Tips: Scroll to zoom, drag to pan, 0 to reset, +/- to zoom, arrows
              to nudge.
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Separate ref to avoid function-ref typing pitfalls
const videoRef = React.createRef<HTMLVideoElement>();

function guessFilenameFromType(mime: string): string {
  if (mime.startsWith("image/")) {
    const ext = mime.split("/")[1] || "jpg";
    return `file.${ext}`;
  }
  if (mime.startsWith("video/")) {
    const ext = mime.split("/")[1] || "mp4";
    return `file.${ext}`;
  }
  return "file.bin";
}

function parseContentDispositionFilename(header: string): string | undefined {
  // Examples: attachment; filename="file.jpg"
  //           inline; filename*=UTF-8''my%20file.jpg
  try {
    const filenameStar = header.match(
      /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i
    )?.[1];
    if (filenameStar) return decodeURIComponent(filenameStar.trim());
    const quoted = header.match(/filename\s*=\s*"([^"]+)"/i)?.[1];
    if (quoted) return quoted.trim();
    const unquoted = header.match(/filename\s*=\s*([^;]+)/i)?.[1];
    if (unquoted) return unquoted.trim();
  } catch {
    /* empty */
  }
  return undefined;
}
