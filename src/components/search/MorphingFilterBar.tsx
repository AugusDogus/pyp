"use client";

import {
  ArrowUpDown,
  Calendar,
  Filter,
  MapPin,
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSearchVisibility } from "~/context/SearchVisibilityContext";
import { SavedSearchesDropdown } from "./SavedSearchesDropdown";
import { SaveSearchDialog } from "./SaveSearchDialog";

interface MorphingFilterBarProps {
  query: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  activeFilterCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  isLoggedIn?: boolean;
  filters: {
    makes: string[];
    colors: string[];
    states: string[];
    salvageYards: string[];
    minYear: number;
    maxYear: number;
    sortBy: string;
  };
  autoOpenSaveDialog?: boolean;
  onAutoOpenHandled?: () => void;
  disabled?: boolean;
}

interface Measurements {
  startTop: number;
  startLeft: number;
  endTop: number;
  endLeft: number;
}

export function MorphingFilterBar({
  query,
  sortBy,
  onSortChange,
  activeFilterCount,
  onToggleFilters,
  isLoggedIn,
  filters,
  autoOpenSaveDialog,
  onAutoOpenHandled,
  disabled,
}: MorphingFilterBarProps) {
  const { headerFilterTargetRef } = useSearchVisibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);

  const getSortIcon = useCallback((sortOption: string) => {
    switch (sortOption) {
      case "newest":
      case "oldest":
        return Calendar;
      case "year-desc":
      case "year-asc":
        return ArrowUpDown;
      case "distance":
        return MapPin;
      default:
        return ArrowUpDown;
    }
  }, []);

  // Measure start (page) and end (header) positions
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const headerTarget = headerFilterTargetRef.current;
      if (!container || !headerTarget) return;

      const startRect = container.getBoundingClientRect();
      const endRect = headerTarget.getBoundingClientRect();

      setMeasurements({
        startTop: startRect.top + window.scrollY,
        startLeft: startRect.left,
        endTop: endRect.top + window.scrollY,
        endLeft: endRect.left,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    const handleScroll = () => {
      if (window.scrollY === 0) measure();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    const timeout = setTimeout(measure, 100);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [headerFilterTargetRef]);

  // Track page scroll
  const { scrollY } = useScroll();

  // Calculate the scroll point where transition should complete
  const transitionEnd = (measurements?.startTop ?? 200) - 16;

  // Top: follows page, docks at 16px (centered in 64px header)
  const top = useTransform(scrollY, (scroll) => {
    const naturalTop = (measurements?.startTop ?? 200) - scroll;
    return Math.max(16, naturalTop);
  });

  // Progress for other properties
  const progress = useTransform(scrollY, (scroll) => {
    if (transitionEnd <= 0) return 0;
    return Math.min(1, Math.max(0, scroll / transitionEnd));
  });

  // Interpolate horizontal position and scale
  const left = useTransform(progress, [0, 1], [
    measurements?.startLeft ?? 600,
    measurements?.endLeft ?? 500,
  ]);
  const scale = useTransform(progress, [0, 1], [1, 0.9]);

  const SortIcon = getSortIcon(sortBy);

  const filterContent = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {isLoggedIn && <SavedSearchesDropdown />}
      <SaveSearchDialog
        query={query}
        filters={filters}
        disabled={disabled}
        isLoggedIn={isLoggedIn}
        autoOpen={autoOpenSaveDialog}
        onAutoOpenHandled={onAutoOpenHandled}
      />

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-fit">
          <div className="flex items-center gap-2">
            <SortIcon className="text-muted-foreground h-4 w-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="year-desc">Year (High to Low)</SelectItem>
          <SelectItem value="year-asc">Year (Low to High)</SelectItem>
          <SelectItem value="distance">Distance (Nearest)</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        className="flex items-center gap-2 bg-transparent"
        onClick={onToggleFilters}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  );

  return (
    <>
      {/* Placeholder that we track - invisible but maintains measurement point */}
      <div ref={containerRef} className="invisible hidden md:block">
        {filterContent}
      </div>

      {/* The morphing filter bar - uses scroll-linked position on desktop */}
      {measurements && (
        <motion.div
          className="fixed z-[60] hidden md:block"
          style={{ top, left, scale, transformOrigin: "top left" }}
        >
          {filterContent}
        </motion.div>
      )}

      {/* Mobile version - static */}
      <div className="md:hidden">
        {filterContent}
      </div>
    </>
  );
}
