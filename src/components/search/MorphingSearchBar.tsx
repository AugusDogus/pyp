"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchVisibility } from "~/context/SearchVisibilityContext";

interface Measurements {
  startTop: number;
  startLeft: number;
  startWidth: number;
  endTop: number;
  endLeft: number;
  endWidth: number;
}

export function MorphingSearchBar() {
  const { searchStateRef, headerSearchTargetRef } = useSearchVisibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);

  // Measure start (page) and end (header) positions
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const headerTarget = headerSearchTargetRef.current;
      if (!container || !headerTarget) return;

      // Get positions accounting for current scroll
      const startRect = container.getBoundingClientRect();
      const endRect = headerTarget.getBoundingClientRect();
      const scrollY = window.scrollY;

      setMeasurements({
        // Absolute page position = viewport position + scroll offset
        startTop: startRect.top + scrollY,
        startLeft: startRect.left,
        startWidth: startRect.width,
        endTop: endRect.top + scrollY,
        endLeft: endRect.left,
        endWidth: endRect.width,
      });
    };

    // Initial measure
    measure();
    
    // Remeasure on resize
    window.addEventListener("resize", measure);
    
    // Also remeasure periodically to catch layout shifts
    const timeout1 = setTimeout(measure, 100);
    const timeout2 = setTimeout(measure, 500);

    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [headerSearchTargetRef]);

  // Track page scroll
  const { scrollY } = useScroll();

  // Calculate the scroll point where transition should complete
  // When scrollY reaches this value, the element should be fully docked at top:16px
  const transitionEnd = (measurements?.startTop ?? 120) - 16;

  // Top: starts following page scroll, then docks at 16px (centered in 64px header)
  // Formula: max(16, startTop - scrollY)
  const top = useTransform(scrollY, (scroll) => {
    const naturalTop = (measurements?.startTop ?? 120) - scroll;
    return Math.max(16, naturalTop);
  });

  // Progress for other properties (0 at start, 1 when fully docked)
  const progress = useTransform(scrollY, (scroll) => {
    if (transitionEnd <= 0) return 0;
    return Math.min(1, Math.max(0, scroll / transitionEnd));
  });

  // Interpolate horizontal position and size based on progress
  const left = useTransform(progress, [0, 1], [
    measurements?.startLeft ?? 16,
    measurements?.endLeft ?? 180,
  ]);
  const width = useTransform(progress, [0, 1], [
    measurements?.startWidth ?? 800,
    measurements?.endWidth ?? 320,
  ]);
  const height = useTransform(progress, [0, 1], [40, 32]);

  const searchState = searchStateRef.current;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      searchState?.onChange(e.target.value);
    },
    [searchState],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchState?.onSearch();
      }
    },
    [searchState],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchState?.query.trim()) {
        searchState.onSearch();
      }
    },
    [searchState],
  );

  return (
    <>
      {/* Placeholder that we track - maintains layout space */}
      <div ref={containerRef} className="mb-6">
        <div className="h-10 w-full" />
        <div className="text-muted-foreground mt-2 text-xs">
          <span>Try: </span>
          <Link
            href="/search?q=Honda+Civic"
            className="text-primary mr-3 underline hover:no-underline"
          >
            Honda Civic
          </Link>
          <Link
            href="/search?q=2020+Toyota"
            className="text-primary mr-3 underline hover:no-underline"
          >
            2020 Toyota
          </Link>
          <Link
            href="/search?q=Ford+F-150"
            className="text-primary underline hover:no-underline"
          >
            Ford F-150
          </Link>
        </div>
      </div>

      {/* The morphing search input - uses scroll-linked position */}
      {measurements && (
        <motion.form
          onSubmit={handleSubmit}
          className="fixed z-[60]"
          style={{ top, left, width }}
        >
          <motion.div className="relative w-full text-sm" style={{ height }}>
            <label className="sr-only" htmlFor="search">
              Search for vehicles
            </label>
            <input
              id="search"
              type="text"
              value={searchState?.query ?? ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter year, make, model (e.g., '2018 Honda Civic')"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-background flex h-full w-full min-w-0 rounded-md border px-3 py-1 pl-10 text-base shadow-sm outline-none focus-visible:ring-[3px] md:text-sm"
            />
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-50 select-none" />
          </motion.div>
        </motion.form>
      )}
    </>
  );
}
