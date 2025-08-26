import React, { ReactNode, useEffect, useLayoutEffect, useRef } from "react";

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
}

/**
 * ChatInfiniteScroll
 * A reusable infinite scroll container for chat/message lists.
 * Prevents overlapping loads, maintains view position on prepend or append,
 * and supports loading indicators.
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
}: ChatInfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Track counts and scroll for prepend/append
  const prevChildrenCountRef = useRef<number>(React.Children.count(children));
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const lastLoadPrependRef = useRef<boolean>(false);
  const lastLoadAppendRef = useRef<boolean>(false);

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
    const currentCount = React.Children.count(children);

    if (container) {
      if (
        lastLoadPrependRef.current &&
        currentCount > prevChildrenCountRef.current
      ) {
        // Prepend: preserve view by offsetting scrollTop
        const delta = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop = prevScrollTopRef.current + delta;
      } else if (
        lastLoadAppendRef.current &&
        currentCount > prevChildrenCountRef.current
      ) {
        // Append: keep scrollTop steady
        container.scrollTop = prevScrollTopRef.current;
      }
    }

    // Reset trackers
    prevChildrenCountRef.current = currentCount;
    lastLoadPrependRef.current = false;
    lastLoadAppendRef.current = false;
  }, [children]);

  // IntersectionObserver for triggers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = { root: container, threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      // Determine callbacks and gating
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

        // Prepend (older) scenario: top sentinel in normal, bottom in reverse
        if (entry.target === topSentinelRef.current && canLoadOlder) {
          prevChildrenCountRef.current = React.Children.count(children);
          prevScrollHeightRef.current = container.scrollHeight;
          prevScrollTopRef.current = container.scrollTop;
          lastLoadPrependRef.current = true;
          loadOlder();
        }

        // Append (newer) scenario
        if (entry.target === bottomSentinelRef.current && canLoadNewer) {
          prevChildrenCountRef.current = React.Children.count(children);
          prevScrollTopRef.current = container.scrollTop;
          lastLoadAppendRef.current = true;
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
  }, [
    hasNext,
    hasPrevious,
    isReverse,
    loadingNext,
    loadingPrevious,
    next,
    previous,
    children,
  ]);

  // Loading spinner
  const Spinner = () => (
    <div className="flex justify-center py-2">
      <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-6 h-6" />
    </div>
  );

  return (
    <div
      className={`overflow-y-auto flex flex-col ${className}`}
      ref={containerRef}
      style={{ height: "100%" }}
    >
      {/* Top sentinel and loader */}
      <div className="w-full h-1" ref={topSentinelRef} />
      {!isReverse && loadingPrevious && <Spinner />}
      {isReverse && loadingNext && <Spinner />}

      {/* Content container */}
      <div
        className={`flex-1 flex flex-col ${isReverse ? "flex-col-reverse" : ""}`}
      >
        {children}
      </div>

      {/* Loader and bottom sentinel */}
      {!isReverse && loadingNext && <Spinner />}
      {isReverse && loadingPrevious && <Spinner />}
      <div className="w-full h-1" ref={bottomSentinelRef} />
    </div>
  );
}
