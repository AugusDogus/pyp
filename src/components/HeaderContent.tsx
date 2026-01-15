"use client";

import Link from "next/link";
import { ThemeToggle } from "~/components/theme/theme-toggle";
import { useSearchVisibility } from "~/context/SearchVisibilityContext";
import { HeaderAuthButtons } from "./HeaderAuthButtons";

interface HeaderContentProps {
  user: { name: string; email: string; image?: string | null } | null;
}

export function HeaderContent({ user }: HeaderContentProps) {
  const { headerSearchTargetRef, headerFilterTargetRef } = useSearchVisibility();

  return (
    <header className="bg-card sticky top-0 z-50 border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          <div className="flex shrink-0 items-center">
            <Link href="/search" className="text-foreground text-xl font-bold">
              Junkyard Index
            </Link>
          </div>
          {/* Target area for morphing search bar */}
          <div
            ref={headerSearchTargetRef}
            className="flex-1 max-w-md"
            aria-hidden="true"
          />
          {/* Target area for morphing filter buttons */}
          <div
            ref={headerFilterTargetRef}
            className="hidden md:block"
            aria-hidden="true"
          />
          <div className="ml-auto flex shrink-0 items-center gap-4">
            <ThemeToggle />
            <HeaderAuthButtons user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
