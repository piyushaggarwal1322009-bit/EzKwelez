import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  variant?: "default" | "critical" | "warning" | "success" | "info";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const variantBorders = {
    default: "border-slate-800/80 bg-slate-900/60",
    critical: "border-red-900/60 bg-red-950/20",
    warning: "border-amber-900/60 bg-amber-950/20",
    success: "border-emerald-900/60 bg-emerald-950/20",
    info: "border-cyan-900/60 bg-cyan-950/20",
  };

  const iconColors = {
    default: "text-slate-400 bg-slate-800/60",
    critical: "text-red-400 bg-red-950/60",
    warning: "text-amber-400 bg-amber-950/60",
    success: "text-emerald-400 bg-emerald-950/60",
    info: "text-cyan-400 bg-cyan-950/60",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 backdrop-blur-sm shadow-sm transition-all hover:border-slate-700",
        variantBorders[variant],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconColors[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</span>
        {subvalue && <span className="text-xs text-slate-400">{subvalue}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-medium",
              trend.isNeutral
                ? "text-slate-400"
                : trend.isPositive
                ? "text-emerald-400"
                : "text-rose-400"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
