import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "destructive" | "success";
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  onClose,
  ...props
}: AlertProps) {
  const configs = {
    info: {
      border: "border-cyan-800/80 bg-cyan-950/30 text-cyan-200",
      icon: Info,
      iconColor: "text-cyan-400",
    },
    warning: {
      border: "border-amber-800/80 bg-amber-950/30 text-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    destructive: {
      border: "border-red-800/80 bg-red-950/30 text-red-200",
      icon: AlertCircle,
      iconColor: "text-red-400",
    },
    success: {
      border: "border-emerald-800/80 bg-emerald-950/30 text-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
    },
  };

  const config = configs[variant];
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed",
        config.border,
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-tight">{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
