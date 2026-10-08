import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DataMode } from "@ezykwelez/shared";
import { Building2, Compass, Menu, Settings, ShieldAlert, Sparkles, X } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { title: "Command", href: "/dashboard", icon: Compass },
  { title: "Campus", href: "/campus", icon: Building2 },
  { title: "Incidents", href: "/incidents", icon: ShieldAlert },
  { title: "Recovery", href: "/recovery", icon: Sparkles },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  campusStatus?: "operational" | "attention" | "disrupted";
  dataMode?: DataMode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefreshed?: Date;
}

export function AppLayout({
  children,
  title = "Campus Continuity Engine",
  description = "Intelligent campus disruption-response, dependency blast-radius analysis, and recovery decision support.",
  campusStatus,
  dataMode = DataMode.SIMULATED,
  onRefresh,
  isRefreshing = false,
  lastRefreshed = new Date(),
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !mobileMenuRef.current) return;
      const focusable = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !mobileMenuRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !mobileMenuRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-reveal]")
    );

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      delete document.documentElement.dataset.scrollEffects;
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    document.documentElement.dataset.scrollEffects = "ready";
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );

    const observeTargets = (root: ParentNode) => {
      if (root instanceof Element && root.matches("[data-scroll-reveal]")) {
        observer.observe(root);
      }
      root.querySelectorAll<HTMLElement>("[data-scroll-reveal]").forEach((target) => {
        observer.observe(target);
      });
    };

    observeTargets(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) observeTargets(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      delete document.documentElement.dataset.scrollEffects;
    };
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{`${title} | EzyKwelez`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-slate-950 border-b border-slate-800 text-white z-40">
          <div className="flex items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-haspopup="dialog"
              className="min-h-11 min-w-11 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-sm">EzyKwelez</span>
          </div>

          {campusStatus && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-amber-800 bg-amber-950 text-amber-300">
              {campusStatus.toUpperCase()}
            </span>
          )}
        </div>

        {/* Desktop and Mobile Container */}
        <div className="flex-1 flex w-full">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden lg:flex shrink-0 sticky top-0 h-screen" />

          {/* Mobile Sidebar overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex" id="mobile-navigation">
              <button
                type="button"
                aria-label="Close navigation menu"
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div
                ref={mobileMenuRef}
                role="dialog"
                aria-modal="true"
                aria-label="Primary navigation"
                tabIndex={-1}
                className="relative z-50 flex flex-col w-60 bg-slate-950 border-r border-slate-800 h-full shadow-2xl"
              >
                <Sidebar onNavigate={() => setMobileMenuOpen(false)} className="w-full h-full border-none" />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
            <Header
              campusStatus={campusStatus}
              dataMode={dataMode}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              lastRefreshed={lastRefreshed}
            />

            <main className="page-enter flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        <nav
          aria-label="Mobile primary navigation"
          className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-slate-800 bg-slate-950/95 backdrop-blur lg:hidden pb-[env(safe-area-inset-bottom)]"
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                  isActive ? "text-brand-primary" : "text-slate-400"
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
