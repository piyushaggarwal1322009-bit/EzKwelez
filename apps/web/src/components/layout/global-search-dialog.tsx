import * as React from "react";
import { useRouter } from "next/router";
import { Dialog } from "@/components/ui/dialog";
import {
  Building2,
  GitFork,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  category: "Location" | "Incident" | "Dependency" | "Recovery" | "Simulation";
  href: string;
  subtext: string;
}

const SEARCH_INDEX: SearchResult[] = [
  {
    id: "loc-library",
    title: "Central Library",
    category: "Location",
    href: "/campus/r0000000-0000-0000-0000-000000000010",
    subtext: "200 seats • Ramanujan Block C • High Occupancy",
  },
  {
    id: "loc-canteen",
    title: "Student Canteen & Food Court",
    category: "Location",
    href: "/campus/r0000000-0000-0000-0000-000000000011",
    subtext: "350 seats • Dining Pavilion • Moderate Occupancy",
  },
  {
    id: "loc-lab-b201",
    title: "Optics & Laser Physics Lab B201",
    category: "Location",
    href: "/campus/r0000000-0000-0000-0000-000000000003",
    subtext: "40 capacity • Ramanujan Block B • Critical Equipment",
  },
  {
    id: "inc-power-grid-b",
    title: "Grid B Main Feeder Trip",
    category: "Incident",
    href: "/incidents/inc-00000000-0000-0000-0000-000000000001",
    subtext: "CRITICAL • Power Outage • Active Disruption",
  },
  {
    id: "node-substation-b",
    title: "Main Power Substation Grid B",
    category: "Dependency",
    href: "/dependencies",
    subtext: "CRITICAL Utility • Feeds Block B Structure",
  },
  {
    id: "node-phys-101",
    title: "PHYS-101 Freshman Physics Practicum",
    category: "Dependency",
    href: "/dependencies",
    subtext: "HIGH Academic Service • 120 Students",
  },
  {
    id: "rec-plan-grid-b",
    title: "Grid B Outage Decision Support Plan",
    category: "Recovery",
    href: "/recovery",
    subtext: "3 Feasible Candidates • Relocation & Tie-Breaker Failover",
  },
  {
    id: "sim-power-drill",
    title: "Transformer Peak Overload Scenario",
    category: "Simulation",
    href: "/simulation",
    subtext: "Counterfactual Drill • 3.5h Duration • 180 Students",
  },
];

export function GlobalSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 6);
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subtext.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const getCategoryIcon = (cat: SearchResult["category"]) => {
    switch (cat) {
      case "Location":
        return Building2;
      case "Incident":
        return ShieldAlert;
      case "Dependency":
        return GitFork;
      case "Recovery":
        return Sparkles;
      case "Simulation":
        return Radio;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Global Campus Intelligence Search">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type to search facilities, disruptions, nodes, plans..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Results list */}
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching records found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item) => {
              const IconComp = getCategoryIcon(item.category);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-slate-800 group-hover:bg-slate-700 text-slate-300">
                      <IconComp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{item.title}</span>
                        <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.subtext}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <span>Navigate with mouse or keyboard</span>
          <span>Esc to close</span>
        </div>
      </div>
    </Dialog>
  );
}
