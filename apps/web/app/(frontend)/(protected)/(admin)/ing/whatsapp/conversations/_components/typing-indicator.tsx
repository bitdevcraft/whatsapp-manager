"use client";

import { cn } from "@workspace/ui/lib/utils";

export interface TypingIndicatorProps {
  className?: string;
  name?: string;
}

export function TypingIndicator({ className, name }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <div className="flex gap-1">
          <TypingDot />
        </div>
      </div>

      {/* Typing text */}
      <span className="text-xs text-muted-foreground">
        {name ? `${name} is ` : ""}typing
        <TypingDots />
      </span>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center">
      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
        .
      </span>
      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
        .
      </span>
      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
        .
      </span>
    </span>
  );
}

function TypingDot() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
