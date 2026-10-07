import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "critical" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-800 text-surface-100 border-surface-700",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/50",
    warning: "bg-amber-950/60 text-amber-300 border-amber-800/50",
    critical: "bg-rose-950/60 text-rose-300 border-rose-800/50",
    outline: "text-foreground border-surface-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
