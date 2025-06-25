// components/feature-flags-provider.tsx
"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQueryState } from "nuqs";
import { FlagConfig, flagConfig } from "@/config/flag";

type FilterFlag = FlagConfig["featureFlags"][number]["value"];

export interface FeatureFlagsContextValue {
  filterFlag: FilterFlag | null;
  enableAdvancedFilter: boolean;
  onFilterFlagChange: (value: FilterFlag) => void;
  clearFilterFlag: () => void; // ← added here
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(
  undefined
);

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider"
    );
  }
  return ctx;
}

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    "filterFlag",
    {
      parse: (v) => {
        if (!v) return null;
        const valid = flagConfig.featureFlags.map((f) => f.value);
        return valid.includes(v as FilterFlag) ? (v as FilterFlag) : null;
      },
      serialize: (v) => v ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    }
  );

  const onFilterFlagChange = useCallback(
    (value: FilterFlag) => setFilterFlag(value),
    [setFilterFlag]
  );
  const clearFilterFlag = useCallback(
    () => setFilterFlag(null),
    [setFilterFlag]
  ); // ← and here

  const enableAdvancedFilter =
    filterFlag === "advancedFilters" || filterFlag === "commandFilters";

  const value = useMemo(
    () => ({
      filterFlag,
      enableAdvancedFilter,
      onFilterFlagChange,
      clearFilterFlag, // ← and include here
    }),
    [filterFlag, enableAdvancedFilter, onFilterFlagChange, clearFilterFlag]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
