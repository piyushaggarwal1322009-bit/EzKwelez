import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertOctagon,
  Building2,
  Compass,
  GitFork,
  LayoutDashboard,
  Radio,
  Settings,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { APP_NAME } from "@ezykwelez/shared";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/",
    icon: Compass,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campus Live",
    href: "/campus",
    icon: Building2,
  },
  {
    title: "Incidents",
    href: "/incidents",
    icon: ShieldAlert,
    badge: "1 Active",
    badgeColor: "bg-red-950 text-red-300 border-red-800",
  },
  {
    title: "Impact Analysis",
    href: "/impact",
    icon: AlertOctagon,
  },
  {
    title: "Dependencies",
    href: "/dependencies",
    icon: GitFork,
  },
  {
    title: "Recovery Planning",
    href: "/recovery",
    icon: Sparkles,
  },
  {
    title: "Simulation",
    href: "/simulation",
    icon: Radio,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 select-none text-slate-100 min-h-screen",
        className
      )}
    >
      {/* Brand Header */}
      <Link
        href="/"
        className="flex items-center gap-3 h-16 px-6 border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-sm text-white font-black text-sm">
          <Zap className="w-5 h-5 fill-current text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-white">{APP_NAME}</span>
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
            Continuity Engine
          </span>
        </div>
      </Link>

      {/* Navigation section */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Command Operations
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? router.pathname === "/"
              : router.pathname === item.href ||
                (item.href !== "/dashboard" && router.pathname.startsWith(item.href));
          const IconComp = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <IconComp
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  )}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded border leading-none",
                    item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / System Health Meta */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-600">v0.1.0 • Phase 6 Ready</div>
      </div>
    </aside>
  );
}
