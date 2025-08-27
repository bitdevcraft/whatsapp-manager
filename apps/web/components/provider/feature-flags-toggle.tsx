// components/feature-flags-toggle.tsx
"use client";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import React from "react";

import { flagConfig } from "@/config/flag";

import { useFeatureFlags } from "./feature-flags-provider";

export function FeatureFlagsToggle() {
  const { clearFilterFlag, filterFlag, onFilterFlagChange } = useFeatureFlags();

  return (
    <div className="w-full overflow-x-auto p-1 flex justify-end">
      <ToggleGroup
        /* no onValueChange here */
        className="w-fit gap-0"
        size="sm"
        type="single"
        value={filterFlag ?? undefined}
        variant="outline"
      >
        {flagConfig.featureFlags.map((flag) => (
          <Tooltip delayDuration={700} key={flag.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                className="whitespace-nowrap px-3 text-xs data-[state=on]:bg-accent/70 data-[state=on]:hover:bg-accent/90"
                onClick={() => {
                  if (filterFlag === flag.value) {
                    clearFilterFlag(); // deselect
                  } else {
                    onFilterFlagChange(flag.value);
                  }
                }}
                value={flag.value}
              >
                <flag.icon className="size-3.5 shrink-0" />
                {flag.label}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent
              align="start"
              className="flex flex-col gap-1.5 border bg-background py-2 font-semibold text-foreground [&>span]:hidden"
              side="bottom"
              sideOffset={6}
            >
              <div>{flag.tooltipTitle}</div>
              <p className="text-balance text-muted-foreground text-xs">
                {flag.tooltipDescription}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  );
}
