// /lib/use-pan-zoom.ts
import { useCallback, useEffect, useRef, useState } from "react";

type PanZoomOptions = {
  initialScale?: number;
  maxScale?: number;
  minScale?: number;
};

type Vec2 = { x: number; y: number };

export function usePanZoom(opts?: PanZoomOptions) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const minScale = opts?.minScale ?? 1;
  const maxScale = opts?.maxScale ?? 5;
  const [scale, setScale] = useState(opts?.initialScale ?? 1);
  const [translate, setTranslate] = useState<Vec2>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const dragging = useRef(false);
  const lastPointer = useRef<Vec2>({ x: 0, y: 0 });
  const lastTranslate = useRef<Vec2>({ x: 0, y: 0 });

  const pinch = useRef<{
    active: boolean;
    center: Vec2;
    lastDistance: number;
  }>({ active: false, center: { x: 0, y: 0 }, lastDistance: 0 });

  // Apply transform (content wrapper)
  const applyTransform = useCallback(
    (nextScale: number, nextTranslate: Vec2) => {
      const node = contentRef.current;
      if (!node) return;
      node.style.transform = `translate3d(${nextTranslate.x}px, ${nextTranslate.y}px, 0) scale(${nextScale})`;
    },
    []
  );

  useEffect(() => {
    applyTransform(scale, translate);
  }, [scale, translate, applyTransform]);

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const zoomBy = useCallback(
    (delta: number, origin?: Vec2) => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const rect = container.getBoundingClientRect();
      const ox = (origin?.x ?? rect.width / 2) - rect.left;
      const oy = (origin?.y ?? rect.height / 2) - rect.top;

      const newScale = clamp(scale * delta, minScale, maxScale);
      if (newScale === scale) return;

      // Adjust translate to zoom around pointer
      const k = newScale / scale;
      const nx = ox - k * (ox - translate.x);
      const ny = oy - k * (oy - translate.y);

      setScale(newScale);
      setTranslate({ x: nx, y: ny });
    },
    [scale, translate, minScale, maxScale]
  );

  // Pointer (mouse / pen) pan
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only primary button
      if (e.button !== 0) return;
      dragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      lastPointer.current = { x: e.clientX, y: e.clientY };
      lastTranslate.current = { ...translate };
    },
    [translate]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || pinch.current.active) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    const next = {
      x: lastTranslate.current.x + dx,
      y: lastTranslate.current.y + dy,
    };
    setTranslate(next);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      //
    }
  }, []);

  // Wheel zoom (debounced per frame)
  const wheelRAF = useRef<null | number>(null);
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        // respect system zoom (pinch trackpads send ctrl+wheel sometimes)
        return;
      }
      e.preventDefault();
      const sign = e.deltaY > 0 ? 1 : -1;
      const factor = sign > 0 ? 1 / 1.1 : 1.1;

      const run = () => zoomBy(factor, { x: e.clientX, y: e.clientY });
      if (prefersReducedMotion) {
        run();
      } else {
        if (wheelRAF.current !== null) cancelAnimationFrame(wheelRAF.current);
        wheelRAF.current = requestAnimationFrame(run);
      }
    },
    [zoomBy, prefersReducedMotion]
  );

  useEffect(() => {
    return () => {
      if (wheelRAF.current !== null) cancelAnimationFrame(wheelRAF.current);
    };
  }, []);

  // Touch pinch/drag
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinch.current.active = true;
        const [t0, t1] = [e.touches[0], e.touches[1]];
        const dx = t1!.clientX - t0!.clientX;
        const dy = t1!.clientY - t0!.clientY;
        pinch.current.lastDistance = Math.hypot(dx, dy);
        pinch.current.center = {
          x: (t0!.clientX + t1!.clientX) / 2,
          y: (t0!.clientY + t1!.clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        dragging.current = true;
        lastPointer.current = {
          x: e.touches[0]!.clientX,
          y: e.touches[0]!.clientY,
        };
        lastTranslate.current = { ...translate };
      }
    },
    [translate]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (pinch.current.active && e.touches.length === 2) {
        e.preventDefault();
        const [t0, t1] = [e.touches[0], e.touches[1]];
        const dx = t1!.clientX - t0!.clientX;
        const dy = t1!.clientY - t0!.clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / (pinch.current.lastDistance || dist);
        pinch.current.lastDistance = dist;
        zoomBy(ratio, pinch.current.center);
      } else if (dragging.current && e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0]!.clientX - lastPointer.current.x;
        const dy = e.touches[0]!.clientY - lastPointer.current.y;
        setTranslate({
          x: lastTranslate.current.x + dx,
          y: lastTranslate.current.y + dy,
        });
      }
    },
    [zoomBy]
  );

  const onTouchEnd = useCallback(() => {
    if (pinch.current.active) {
      pinch.current.active = false;
    }
    dragging.current = false;
  }, []);

  // Keyboard
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const nudge = 20;
      if (e.key === "0") {
        e.preventDefault();
        reset();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomBy(1.1);
      } else if (e.key === "-") {
        e.preventDefault();
        zoomBy(1 / 1.1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setTranslate((t) => ({ ...t, y: t.y + nudge }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setTranslate((t) => ({ ...t, y: t.y - nudge }));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setTranslate((t) => ({ ...t, x: t.x + nudge }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setTranslate((t) => ({ ...t, x: t.x - nudge }));
      }
    },
    [reset, zoomBy]
  );

  return {
    containerRef,
    contentRef,
    handlers: {
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      onWheel,
    },
    reset,
    scale,
    setScale,
    setTranslate,
    translate,
    zoomBy,
  };
}
