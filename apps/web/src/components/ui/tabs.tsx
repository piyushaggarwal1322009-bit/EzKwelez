import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = React.useState(value || defaultValue || "");
  const baseId = React.useId().replace(/:/g, "");

  const currentTab = value !== undefined ? value : active;
  const handleTabChange = (val: string) => {
    setActive(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleTabChange, baseId }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 select-none overflow-x-auto max-w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${context.baseId}-tab-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
      aria-controls={`${context.baseId}-panel-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => context.setActiveTab(value)}
      onKeyDown={(event) => {
        const tabs = Array.from(
          event.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
        );
        const currentIndex = tabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
        isActive
          ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
          : "hover:text-slate-200 hover:bg-slate-800/40",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  if (context.activeTab !== value) return null;

  const panelId = value.replace(/[^a-zA-Z0-9_-]/g, "-");
  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-panel-${panelId}`}
      aria-labelledby={`${context.baseId}-tab-${panelId}`}
      tabIndex={0}
      className={cn("mt-2 outline-none", className)}
    >
      {children}
    </div>
  );
}
