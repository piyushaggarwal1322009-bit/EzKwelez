import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "critical"
    | "high"
    | "moderate"
    | "low"
    | "info"
    | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    outline: "text-slate-300 border-slate-700 bg-transparent",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80",
    warning: "bg-amber-950/60 text-amber-300 border-amber-800/80",
    destructive: "bg-red-950/60 text-red-300 border-red-800/80",
    critical: "bg-red-950 text-red-200 border-red-700 font-semibold shadow-sm",
    high: "bg-orange-950/70 text-orange-300 border-orange-800",
    moderate: "bg-amber-950/60 text-amber-300 border-amber-800",
    low: "bg-blue-950/60 text-blue-300 border-blue-800",
    info: "bg-cyan-950/60 text-cyan-300 border-cyan-800",
    neutral: "bg-slate-900 text-slate-400 border-slate-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
