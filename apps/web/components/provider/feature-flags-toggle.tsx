// components/feature-flags-toggle.tsx
"use client";
import React from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/tooltip";
import { useFeatureFlags } from "./feature-flags-provider";
import { flagConfig } from "@/config/flag";

export function FeatureFlagsToggle() {
  const { filterFlag, onFilterFlagChange, clearFilterFlag } = useFeatureFlags();

  return (
    <div className="w-full overflow-x-auto p-1 flex justify-end">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={filterFlag ?? undefined}
        /* no onValueChange here */
        className="w-fit gap-0"
      >
        {flagConfig.featureFlags.map((flag) => (
          <Tooltip key={flag.value} delayDuration={700}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={flag.value}
                className="whitespace-nowrap px-3 text-xs data-[state=on]:bg-accent/70 data-[state=on]:hover:bg-accent/90"
                onClick={() => {
                  if (filterFlag === flag.value) {
                    clearFilterFlag(); // deselect
                  } else {
                    onFilterFlagChange(flag.value);
                  }
                }}
              >
                <flag.icon className="size-3.5 shrink-0" />
                {flag.label}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent
              align="start"
              side="bottom"
              sideOffset={6}
              className="flex flex-col gap-1.5 border bg-background py-2 font-semibold text-foreground [&>span]:hidden"
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
