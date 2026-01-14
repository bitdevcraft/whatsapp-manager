"use client";

import { cn } from "@workspace/ui/lib/utils";
import { formatDateSeparator } from "../_lib/message-utils";

export interface DateSeparatorProps {
  date: Date | string;
  className?: string;
}

export function DateSeparator({ date, className }: DateSeparatorProps) {
  return (
    <div className={cn("flex items-center justify-center my-4", className)}>
      <div className="relative px-3">
        <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          {formatDateSeparator(date)}
        </span>
      </div>
    </div>
  );
}
