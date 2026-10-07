import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle, ShieldAlert } from "lucide-react";

export type StatusType =
  | "operational"
  | "attention"
  | "degraded"
  | "disrupted"
  | "critical"
  | "investigating"
  | "mitigated"
  | "resolved"
  | "closed"
  | "unknown";

interface StatusIndicatorProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  showPulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  showPulse = false,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const normStatus = (status || "unknown").toLowerCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case "operational":
      case "resolved":
      case "approved":
      case "feasible":
        return {
          text: label || (normStatus.charAt(0).toUpperCase() + normStatus.slice(1)),
          color: "text-emerald-400",
          dotColor: "bg-emerald-500",
          icon: CheckCircle2,
          pulseClass: "bg-emerald-400",
        };
      case "attention":
      case "triaged":
      case "investigating":
      case "under_review":
      case "conditionally_feasible":
        return {
          text: label || (normStatus.charAt(0).toUpperCase() + normStatus.slice(1).replace("_", " ")),
          color: "text-amber-400",
          dotColor: "bg-amber-500",
          icon: Clock,
          pulseClass: "bg-amber-400",
        };
      case "degraded":
      case "mitigated":
        return {
          text: label || (normStatus.charAt(0).toUpperCase() + normStatus.slice(1)),
          color: "text-orange-400",
          dotColor: "bg-orange-500",
          icon: AlertTriangle,
          pulseClass: "bg-orange-400",
        };
      case "disrupted":
      case "critical":
      case "active":
      case "failed":
      case "infeasible":
      case "rejected":
        return {
          text: label || (normStatus.charAt(0).toUpperCase() + normStatus.slice(1)),
          color: "text-red-400",
          dotColor: "bg-red-500",
          icon: ShieldAlert,
          pulseClass: "bg-red-400",
        };
      case "closed":
        return {
          text: label || "Closed",
          color: "text-slate-400",
          dotColor: "bg-slate-500",
          icon: XCircle,
          pulseClass: "bg-slate-400",
        };
      default:
        return {
          text: label || "Unknown",
          color: "text-slate-400",
          dotColor: "bg-slate-500",
          icon: HelpCircle,
          pulseClass: "bg-slate-400",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium select-none",
        config.color,
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.pulseClass
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dotColor)} />
      </span>
      {showIcon && <IconComponent className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", "shrink-0")} />}
      <span>{config.text}</span>
    </span>
  );
}
