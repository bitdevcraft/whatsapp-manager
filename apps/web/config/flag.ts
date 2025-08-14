import { Filter } from "lucide-react";

export type FlagConfig = typeof flagConfig;

export const flagConfig = {
  featureFlags: [
    {
      label: "",
      value: "advancedFilters" as const,
      icon: Filter,
      tooltipTitle: "Advanced filters",
      tooltipDescription: "",
    },
  ],
};
