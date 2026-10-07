import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load operational data",
  message,
  code,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-900/40 bg-red-950/10",
        className
      )}
    >
      <div className="p-3 rounded-xl bg-red-950/60 text-red-400 border border-red-800/60 mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-200">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 mb-2 leading-relaxed">
        {message}
      </p>
      {code && (
        <span className="font-mono text-[11px] text-red-400/80 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30 mb-4">
          CODE: {code}
        </span>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-2">
          <RotateCw className="w-3.5 h-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
