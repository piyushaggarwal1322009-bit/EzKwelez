import * as React from "react";
import Head from "next/head";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DataMode } from "@ezykwelez/shared";
import { Menu, X } from "lucide-react";

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
  campusStatus = "attention",
  dataMode = DataMode.SIMULATED,
  onRefresh,
  isRefreshing = false,
  lastRefreshed = new Date(),
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <Head>
        <title>{`${title} | EzyKwelez`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-slate-950 border-b border-slate-800 text-white z-40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-sm">EzyKwelez</span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
            {campusStatus.toUpperCase()}
          </span>
        </div>

        {/* Desktop and Mobile Container */}
        <div className="flex-1 flex w-full">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden lg:flex shrink-0 sticky top-0 h-screen" />

          {/* Mobile Sidebar overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative z-50 flex flex-col w-64 bg-slate-950 border-r border-slate-800 h-full shadow-2xl">
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

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
