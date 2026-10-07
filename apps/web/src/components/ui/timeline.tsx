import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Circle } from "lucide-react";

export interface TimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  icon?: LucideIcon;
  variant?: "default" | "critical" | "warning" | "success" | "info";
  metadata?: Record<string, unknown>;
}

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-xs text-slate-500 py-4 text-center">No timeline events recorded.</div>;
  }

  const variantColors = {
    default: "border-slate-700 bg-slate-800 text-slate-300",
    critical: "border-red-600 bg-red-950 text-red-300",
    warning: "border-amber-600 bg-amber-950 text-amber-300",
    success: "border-emerald-600 bg-emerald-950 text-emerald-300",
    info: "border-cyan-600 bg-cyan-950 text-cyan-300",
  };

  return (
    <div className={cn("relative pl-6 space-y-6 border-l border-slate-800", className)}>
      {items.map((item) => {
        const IconComponent = item.icon || Circle;
        const variant = item.variant || "default";

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={cn(
                "absolute -left-[31px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full border shadow-sm",
                variantColors[variant]
              )}
            >
              <IconComponent className="w-2.5 h-2.5" />
            </div>

            {/* Event content */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-100">{item.title}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              )}

              {item.actor && (
                <div className="text-[10px] font-mono text-slate-500">
                  By: <span className="text-slate-400">{item.actor}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
