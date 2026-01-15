"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
  type RefObject,
} from "react";

interface SearchState {
  query: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

interface SearchVisibilityContextValue {
  isSearchVisible: boolean;
  setIsSearchVisible: (visible: boolean) => void;
  searchStateRef: MutableRefObject<SearchState | null>;
  headerSearchTargetRef: RefObject<HTMLDivElement | null>;
  headerFilterTargetRef: RefObject<HTMLDivElement | null>;
}

const SearchVisibilityContext =
  createContext<SearchVisibilityContextValue | null>(null);

export function SearchVisibilityProvider({ children }: { children: ReactNode }) {
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const searchStateRef = useRef<SearchState | null>(null);
  const headerSearchTargetRef = useRef<HTMLDivElement | null>(null);
  const headerFilterTargetRef = useRef<HTMLDivElement | null>(null);

  const setVisibility = useCallback((visible: boolean) => {
    setIsSearchVisible(visible);
  }, []);

  const value = useMemo(
    () => ({
      isSearchVisible,
      setIsSearchVisible: setVisibility,
      searchStateRef,
      headerSearchTargetRef,
      headerFilterTargetRef,
    }),
    [isSearchVisible, setVisibility],
  );

  return (
    <SearchVisibilityContext.Provider value={value}>
      {children}
    </SearchVisibilityContext.Provider>
  );
}

export function useSearchVisibility() {
  const context = useContext(SearchVisibilityContext);
  if (!context) {
    throw new Error(
      "useSearchVisibility must be used within a SearchVisibilityProvider",
    );
  }
  return context;
}
