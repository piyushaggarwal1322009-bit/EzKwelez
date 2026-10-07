import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
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

  const currentTab = value !== undefined ? value : active;
  const handleTabChange = (val: string) => {
    setActive(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleTabChange }}>
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
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none disabled:opacity-50",
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

  return <div className={cn("mt-2 outline-none", className)}>{children}</div>;
}
