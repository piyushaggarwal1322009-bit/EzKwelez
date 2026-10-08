import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import {
  AlertOctagon,
  Building2,
  Compass,
  GitFork,
  Radio,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { APP_NAME } from "@ezykwelez/shared";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Monitor",
    items: [
      { title: "Command Center", href: "/dashboard", icon: Compass },
      { title: "Campus Live", href: "/campus", icon: Building2 },
    ],
  },
  {
    title: "Respond",
    items: [
      { title: "Incidents", href: "/incidents", icon: ShieldAlert },
      { title: "Impact Analysis", href: "/impact", icon: AlertOctagon },
      { title: "Dependencies", href: "/dependencies", icon: GitFork },
    ],
  },
  {
    title: "Recover",
    items: [
      { title: "Recovery Planning", href: "/recovery", icon: Sparkles },
      { title: "Simulation", href: "/simulation", icon: Radio },
    ],
  },
  {
    title: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
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
        "flex flex-col w-60 bg-slate-950 border-r border-slate-800/80 select-none text-slate-100 min-h-screen",
        className
      )}
    >
      {/* Brand Header */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 h-16 px-6 border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-brand-primary text-[var(--color-text-on-brand)] font-black text-sm">
          <span aria-hidden="true">E</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-white">{APP_NAME}</span>
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
            Campus operations
          </span>
        </div>
      </Link>

      {/* Navigation section */}
      <nav aria-label="Primary" className="flex-1 py-5 px-3 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <section key={section.title} aria-label={section.title} className="space-y-1">
            <h2 className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </h2>
            {section.items.map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
              const IconComp = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 min-h-11 px-3 rounded-md border-l-2 text-sm font-medium transition-colors group",
                    isActive
                      ? "border-brand-primary bg-brand-primary/10 text-slate-50"
                      : "border-transparent text-slate-300 hover:text-slate-50 hover:bg-slate-900"
                  )}
                >
                  <IconComp
                    aria-hidden="true"
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-brand-primary"
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>

      {/* Footer / System Health Meta */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        EzyKwelez · Campus continuity
      </div>
    </aside>
  );
}
