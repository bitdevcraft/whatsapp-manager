import React, { ReactNode, useRef, useEffect, useLayoutEffect } from "react";

// Props interface for the ChatInfiniteScroll component (non-generic)
export interface ChatInfiniteScrollProps {
  /** If true, scroll to the middle on mount */
  showMiddle: boolean;
  /** Whether there's more data to load below */
  hasNext: boolean;
  /** Whether there's more data to load above */
  hasPrevious: boolean;
  /** If true, render items in reverse order */
  isReverse: boolean;
  /** Callback to load next page when scrolling down/up */
  next: () => void;
  /** Callback to load previous page when scrolling up/down */
  previous: () => void;
  /** Indicates if a next-page load is in progress */
  loadingNext?: boolean;
  /** Indicates if a previous-page load is in progress */
  loadingPrevious?: boolean;
  /** Custom wrapper classes */
  className?: string;
  /** Message elements or other children */
  children: ReactNode;
}

/**
 * ChatInfiniteScroll
 * A reusable infinite scroll container for chat/message lists.
 * Maintains view position on prepend and supports loading indicators.
 */
export function ChatInfiniteScroll({
  showMiddle,
  hasNext,
  hasPrevious,
  isReverse,
  next,
  previous,
  loadingNext = false,
  loadingPrevious = false,
  className = "",
  children,
}: ChatInfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Track scroll metrics for prepending
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const prevChildrenCountRef = useRef<number>(React.Children.count(children));
  const lastLoadPrependRef = useRef<boolean>(false);

  // On mount or when mode changes: scroll to middle, bottom, or top
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

  // After render: if items were prepended, adjust scroll to maintain view
  useLayoutEffect(() => {
    const container = containerRef.current;
    const currentCount = React.Children.count(children);

    if (
      container &&
      lastLoadPrependRef.current &&
      currentCount > prevChildrenCountRef.current
    ) {
      const delta = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = prevScrollTopRef.current + delta;
    }

    prevChildrenCountRef.current = currentCount;
    lastLoadPrependRef.current = false;
  }, [children]);

  // Set up IntersectionObserver for sentinels
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = { root: container, threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      const loadOlder = isReverse ? next : previous;
      const loadNewer = isReverse ? previous : next;
      const canLoadOlder = isReverse ? hasNext : hasPrevious;
      const canLoadNewer = isReverse ? hasPrevious : hasNext;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Prepend scenario
        if (entry.target === topSentinelRef.current && canLoadOlder) {
          prevScrollHeightRef.current = container.scrollHeight;
          prevScrollTopRef.current = container.scrollTop;
          lastLoadPrependRef.current = true;
          loadOlder();
        }

        // Append scenario
        if (entry.target === bottomSentinelRef.current && canLoadNewer) {
          loadNewer();
        }
      });
    }, options);

    if (topSentinelRef.current) observer.observe(topSentinelRef.current);
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current);

    return () => {
      if (topSentinelRef.current) observer.unobserve(topSentinelRef.current);
      if (bottomSentinelRef.current)
        observer.unobserve(bottomSentinelRef.current);
      observer.disconnect();
    };
  }, [hasNext, hasPrevious, isReverse, next, previous]);

  // Simple spinner indicator
  const Spinner = () => (
    <div className="flex justify-center py-2">
      <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-6 h-6" />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto flex flex-col ${className}`}
      style={{ height: "100%" }}
    >
      {/* Top sentinel */}
      <div ref={topSentinelRef} className="w-full h-1" />
      {/* Loading indicator at top if applicable */}
      {!isReverse && loadingPrevious && <Spinner />}
      {isReverse && loadingNext && <Spinner />}

      {/* Content container */}
      <div
        className={`flex-1 flex flex-col ${isReverse ? "flex-col-reverse" : ""}`}
      >
        {children}
      </div>

      {/* Loading indicator at bottom if applicable */}
      {!isReverse && loadingNext && <Spinner />}
      {isReverse && loadingPrevious && <Spinner />}
      {/* Bottom sentinel */}
      <div ref={bottomSentinelRef} className="w-full h-1" />
    </div>
  );
}
