import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataProvenanceBadge } from "@/components/ui/data-provenance-badge";
import { DataMode } from "@ezykwelez/shared";
import { GlobalSearchDialog } from "./global-search-dialog";

interface HeaderProps {
  campusStatus?: "operational" | "attention" | "disrupted";
  lastRefreshed?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  dataMode?: DataMode;
  className?: string;
}

export function Header({
  campusStatus = "operational",
  lastRefreshed = new Date(),
  onRefresh,
  isRefreshing = false,
  dataMode = DataMode.SIMULATED,
  className,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [timeAgo, setTimeAgo] = React.useState("Just now");

  React.useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
      if (seconds < 10) setTimeAgo("Just now");
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  // Handle Ctrl+K for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const statusConfig = {
    operational: {
      label: "Campus Operational",
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      icon: CheckCircle2,
    },
    attention: {
      label: "Operational Attention",
      color: "text-amber-400 bg-amber-950/60 border-amber-800",
      icon: AlertTriangle,
    },
    disrupted: {
      label: "Active Disruption",
      color: "text-red-400 bg-red-950/60 border-red-800 animate-pulse",
      icon: ShieldAlert,
    },
  }[campusStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-slate-100",
          className
        )}
      >
        {/* Left: Quick search button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition-colors w-48 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search campus, incidents, nodes...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Status, Provenance Mode, Refresh, Notification */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Global Campus Status Pill */}
          <div
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold select-none",
              statusConfig.color
            )}
          >
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{statusConfig.label}</span>
          </div>

          {/* Data Provenance Mode */}
          <DataProvenanceBadge mode={dataMode} size="sm" />

          {/* Refresh Action */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden md:inline font-mono text-[11px]">{timeAgo}</span>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh live telemetry and incidents"
                className="h-8 w-8 text-slate-400 hover:text-white"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-blue-400")} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <GlobalSearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
