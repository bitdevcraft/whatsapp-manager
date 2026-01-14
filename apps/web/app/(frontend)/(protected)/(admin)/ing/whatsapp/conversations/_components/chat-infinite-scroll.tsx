"use client";

import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

// Props interface for the ChatInfiniteScroll component
export interface ChatInfiniteScrollProps {
  /** Message elements or other children */
  children: ReactNode;
  /** Custom wrapper classes */
  className?: string;
  /** Whether there's more data to load below */
  hasNext: boolean;
  /** Whether there's more data to load above */
  hasPrevious: boolean;
  /** If true, render items in reverse order */
  isReverse: boolean;
  /** Indicates if a next-page load is in progress */
  loadingNext?: boolean;
  /** Indicates if a previous-page load is in progress */
  loadingPrevious?: boolean;
  /** Callback to load next page */
  next: () => void;
  /** Callback to load previous page */
  previous: () => void;
  /** If true, scroll to the middle on mount */
  showMiddle: boolean;
  /** Optional delay (ms) before applying any scroll anchoring after new data arrives */
  anchorDelayMs?: number;
  /** If true, disable any automatic scroll anchoring on new data (no auto-adjust at all) */
  disableAutoAnchor?: boolean;
}

/**
 * ChatInfiniteScroll
 * A reusable infinite scroll container for chat/message lists.
 * Prevents overlapping loads, maintains view on prepend/append (no auto-jumps),
 * supports loading indicators, and anchors to the element currently in view.
 */
export function ChatInfiniteScroll({
  children,
  className = "",
  hasNext,
  hasPrevious,
  isReverse,
  loadingNext = false,
  loadingPrevious = false,
  next,
  previous,
  showMiddle,
  anchorDelayMs = 0,
  disableAutoAnchor = false,
}: ChatInfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Track counts and scroll for prepend/append
  const prevChildrenCountRef = useRef<number>(React.Children.count(children));
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const lastLoadPrependRef = useRef<boolean>(false);
  const lastLoadAppendRef = useRef<boolean>(false);

  // Timer for delayed anchoring
  const anchorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Anchor the exact element currently in view (closest to container center)
  const anchorRef = useRef<{ el: HTMLElement | null; offset: number }>({
    el: null,
    offset: 0,
  });

  // Mirror the current children count into a ref so the observer effect
  // doesn't need to depend directly on `children`.
  const childrenCountRef = useRef<number>(React.Children.count(children));
  useEffect(() => {
    childrenCountRef.current = React.Children.count(children);
  }, [children]);

  // Helper: capture the element near the center of the viewport inside `contentRef`
  const captureAnchor = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const rect = container.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    let el = document.elementFromPoint(x, y) as HTMLElement | null;
    // Ensure the element belongs to our content container
    while (el && el !== content && el.parentElement) {
      if (el.parentElement === content) break;
      el = el.parentElement as HTMLElement | null;
    }
    // Fallback: pick first child intersecting the center line
    if (!el || (el.parentElement && el.parentElement !== content)) {
      // find a direct child around scrollTop
      const childrenEls = Array.from(content.children) as HTMLElement[];
      const centerY = container.scrollTop + container.clientHeight / 2;
      el =
        childrenEls.find(
          (c) =>
            c.offsetTop <= centerY && c.offsetTop + c.offsetHeight >= centerY
        ) ||
        childrenEls[0] ||
        null;
    }
    if (el) {
      anchorRef.current = {
        el,
        offset: el.offsetTop - container.scrollTop,
      };
    } else {
      anchorRef.current = { el: null, offset: 0 };
    }
  };

  // Initial scroll: middle, bottom, or top
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (showMiddle) {
      container.scrollTop =
        (container.scrollHeight - container.clientHeight) / 2;
    } else if (isReverse) {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTop = 0;
    }
  }, [showMiddle, isReverse]);

  // After new items: adjust scroll if prepend or append occurred
  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const currentCount = React.Children.count(children);

    // Clear any pending delayed anchor from a previous change
    if (anchorTimerRef.current) {
      clearTimeout(anchorTimerRef.current);
      anchorTimerRef.current = null;
    }

    const shouldPrependAdjust =
      lastLoadPrependRef.current && currentCount > prevChildrenCountRef.current;
    const shouldAppendAdjust =
      lastLoadAppendRef.current && currentCount > prevChildrenCountRef.current;

    const runAnchor = () => {
      if (!container) return;
      if (disableAutoAnchor) return; // Do nothing if disabled

      // First try to anchor to the previously visible element
      const anchorEl = anchorRef.current.el;
      if (anchorEl && content && content.contains(anchorEl)) {
        container.scrollTop = anchorEl.offsetTop - anchorRef.current.offset;
      } else if (shouldPrependAdjust) {
        // Fallback: Prepend — preserve by height delta
        const delta = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop = prevScrollTopRef.current + delta;
      } else if (shouldAppendAdjust) {
        // Fallback: Append — keep previous scrollTop
        container.scrollTop = prevScrollTopRef.current;
      }

      // Nudge away from sentinels by h-1 to avoid re-intersection loops
      if (shouldPrependAdjust) {
        const bump = Math.max(
          0,
          (topSentinelRef.current?.offsetHeight ?? 0) - 1
        );
        if (bump > 0) container.scrollTop += bump;
      } else if (shouldAppendAdjust) {
        const bump = Math.max(
          0,
          (bottomSentinelRef.current?.offsetHeight ?? 0) - 1
        );
        if (bump > 0) container.scrollTop -= bump;
      }

      // Reset anchor
      anchorRef.current = { el: null, offset: 0 };
    };

    if (shouldPrependAdjust || shouldAppendAdjust) {
      if (anchorDelayMs > 0) {
        anchorTimerRef.current = setTimeout(runAnchor, anchorDelayMs);
      } else {
        runAnchor();
      }
    }

    // Reset trackers
    prevChildrenCountRef.current = currentCount;
    lastLoadPrependRef.current = false;
    lastLoadAppendRef.current = false;

    return () => {
      if (anchorTimerRef.current) {
        clearTimeout(anchorTimerRef.current);
        anchorTimerRef.current = null;
      }
    };
  }, [children, anchorDelayMs, disableAutoAnchor]);

  // Stable options object (optional micro-opt)
  const observerOptions = useMemo<IntersectionObserverInit>(
    () => ({
      root: containerRef.current ?? undefined,
      threshold: 0.1,
      // rootMargin: "200px 0px 200px 0px", // optional prefetching margin
    }),
    []
  );

  // IntersectionObserver for triggers (with ref snapshots)
  useEffect(() => {
    const container = containerRef.current;
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;
    if (!container || !topEl || !bottomEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Determine callbacks and gating (use latest props via closure)
        const loadOlder = isReverse ? next : previous;
        const loadNewer = isReverse ? previous : next;
        const canLoadOlder =
          (isReverse ? hasNext : hasPrevious) &&
          !(isReverse ? loadingNext : loadingPrevious);
        const canLoadNewer =
          (isReverse ? hasPrevious : hasNext) &&
          !(isReverse ? loadingPrevious : loadingNext);

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Prepend (older) scenario: triggered by top sentinel
          if (entry.target === topEl && canLoadOlder) {
            // Capture the element currently in view BEFORE we load
            captureAnchor();
            prevChildrenCountRef.current = childrenCountRef.current;
            prevScrollHeightRef.current = container.scrollHeight;
            prevScrollTopRef.current = container.scrollTop;
            lastLoadPrependRef.current = true;
            loadOlder();
          }

          // Append (newer) scenario: triggered by bottom sentinel
          if (entry.target === bottomEl && canLoadNewer) {
            // Capture the element currently in view BEFORE we load
            captureAnchor();
            prevChildrenCountRef.current = childrenCountRef.current;
            prevScrollTopRef.current = container.scrollTop;
            lastLoadAppendRef.current = true;
            loadNewer();
          }
        });
      },
      { ...observerOptions, root: container }
    );

    observer.observe(topEl);
    observer.observe(bottomEl);

    return () => {
      observer.unobserve(topEl);
      observer.unobserve(bottomEl);
      observer.disconnect();
    };
  }, [
    // Dependencies that truly affect loading behavior:
    hasNext,
    hasPrevious,
    isReverse,
    loadingNext,
    loadingPrevious,
    next,
    previous,
    observerOptions,
  ]);

  // Loading spinner
  const Spinner = () => (
    <div className="flex justify-center py-2">
      <div className="animate-spin border-4 border-muted border-t-primary rounded-full w-6 h-6" />
    </div>
  );

  return (
    <div
      aria-busy={loadingNext || loadingPrevious}
      className={`overflow-y-auto overscroll-contain flex flex-col ${className}`}
      ref={containerRef}
      role="feed"
      style={{ height: "100%" }}
    >
      {/* Top sentinel and loader */}
      <div aria-hidden="true" className="w-full h-1" ref={topSentinelRef} />
      {!isReverse && loadingPrevious && <Spinner />}
      {isReverse && loadingNext && <Spinner />}

      {/* Content container */}
      <div
        ref={contentRef}
        className={`flex-1 flex flex-col ${isReverse ? "flex-col-reverse" : ""}`}
      >
        {children}
      </div>

      {/* Loader and bottom sentinel */}
      {!isReverse && loadingNext && <Spinner />}
      {isReverse && loadingPrevious && <Spinner />}
      <div aria-hidden="true" className="w-full h-1" ref={bottomSentinelRef} />
    </div>
  );
}
