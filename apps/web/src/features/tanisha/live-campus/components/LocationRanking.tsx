/**
 * LocationRanking Component
 * Renders dynamically ordered operational rankings:
 * 1. Most Crowded Locations (sorted by occupancy percentage desc)
 * 2. Weakest Connectivity Locations (sorted by signal score asc)
 * Owner: Tanisha
 */

import * as React from 'react';
import { LocationRankingItem } from '../types/campus';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationRankingProps {
  mostCrowded: LocationRankingItem[];
  weakestConnectivity: LocationRankingItem[];
  className?: string;
}

export function LocationRanking({
  mostCrowded,
  weakestConnectivity,
  className,
}: LocationRankingProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      {/* 1. Most Crowded */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-400">
                <Flame className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Most Crowded Locations
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Ordered by highest capacity utilization
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Top {mostCrowded.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {mostCrowded.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No occupancy data available
            </div>
          ) : (
            <ol className="divide-y divide-slate-800/80" aria-label="Most crowded campus locations ranking">
              {mostCrowded.map((item) => (
                <li
                  key={item.locationId}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-mono font-bold shrink-0',
                        item.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      )}
                      aria-label={`Rank ${item.rank}`}
                    >
                      {item.rank}
                    </span>
                    <div className="truncate">
                      <p className="font-medium text-slate-200 truncate">
                        {item.locationName}
                      </p>
                      {item.secondaryInfo && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {item.secondaryInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-slate-100">
                      {item.formattedValue}
                    </span>
                    <Badge
                      variant={item.statusVariant}
                      className="text-[9px] px-1.5 py-0 uppercase font-mono tracking-wider font-semibold"
                    >
                      {item.statusLabel}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* 2. Weakest Connectivity */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-950/60 border border-rose-800/40 text-rose-400">
                <WifiOff className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Weakest Connectivity
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Ordered by lowest AP signal score
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Top {weakestConnectivity.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {weakestConnectivity.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No connectivity data available
            </div>
          ) : (
            <ol className="divide-y divide-slate-800/80" aria-label="Weakest connectivity campus locations ranking">
              {weakestConnectivity.map((item) => (
                <li
                  key={item.locationId}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-mono font-bold shrink-0',
                        item.rank === 1
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400'
                      )}
                      aria-label={`Rank ${item.rank}`}
                    >
                      {item.rank}
                    </span>
                    <div className="truncate">
                      <p className="font-medium text-slate-200 truncate">
                        {item.locationName}
                      </p>
                      {item.secondaryInfo && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {item.secondaryInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-slate-100">
                      {item.formattedValue}
                    </span>
                    <Badge
                      variant={item.statusVariant}
                      className="text-[9px] px-1.5 py-0 uppercase font-mono tracking-wider font-semibold"
                    >
                      {item.statusLabel}
                    </Badge>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
