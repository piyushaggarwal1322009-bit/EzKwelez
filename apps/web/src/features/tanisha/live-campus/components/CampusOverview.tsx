/**
 * CampusOverview Component
 * High-density command-center summary cards derived strictly from calculations.ts
 * Owner: Tanisha
 */

import * as React from 'react';
import { CampusOverviewMetrics } from '../types/campus';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, WifiOff, Building2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CampusOverviewProps {
  metrics: CampusOverviewMetrics;
  className?: string;
}

export function CampusOverview({ metrics, className }: CampusOverviewProps) {
  return (
    <section
      aria-label="Campus operational overview metrics"
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
    >
      {/* 1. Students Tracked */}
      <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Students Tracked</span>
            <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {metrics.totalStudentsTracked.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {metrics.totalMonitoredCapacity.toLocaleString()} cap
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span>Overall campus load: <strong className="text-slate-200 font-mono">{metrics.overallOccupancyPercentage}%</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Busy Locations */}
      <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className={cn(
          "absolute top-0 left-0 h-1 w-full",
          metrics.busyLocationsCount > 0 ? "bg-amber-500" : "bg-emerald-500"
        )} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Busy Locations</span>
            <div className={cn(
              "p-1.5 rounded-lg border",
              metrics.busyLocationsCount > 0
                ? "bg-amber-950/60 border-amber-800/40 text-amber-400"
                : "bg-emerald-950/60 border-emerald-800/40 text-emerald-400"
            )}>
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-extrabold tracking-tight font-mono",
              metrics.busyLocationsCount > 0 ? "text-amber-400" : "text-emerald-400"
            )}>
              {metrics.busyLocationsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              of {metrics.locationsMonitored} zones
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {metrics.busyLocationsCount > 0
              ? 'Locations exceeding 75% operational capacity'
              : 'All monitored locations within nominal load'}
          </div>
        </CardContent>
      </Card>

      {/* 3. Low Connectivity Locations */}
      <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className={cn(
          "absolute top-0 left-0 h-1 w-full",
          metrics.lowConnectivityCount > 0 ? "bg-rose-500" : "bg-emerald-500"
        )} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Low Connectivity</span>
            <div className={cn(
              "p-1.5 rounded-lg border",
              metrics.lowConnectivityCount > 0
                ? "bg-rose-950/60 border-rose-800/40 text-rose-400"
                : "bg-emerald-950/60 border-emerald-800/40 text-emerald-400"
            )}>
              <WifiOff className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-extrabold tracking-tight font-mono",
              metrics.lowConnectivityCount > 0 ? "text-rose-400" : "text-emerald-400"
            )}>
              {metrics.lowConnectivityCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              zones degraded
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {metrics.lowConnectivityCount > 0
              ? 'Signal score below 40 / 100 threshold'
              : 'All zones reporting fair to excellent telemetry'}
          </div>
        </CardContent>
      </Card>

      {/* 4. Locations Monitored */}
      <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Locations Monitored</span>
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {metrics.locationsMonitored}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              active checkpoints
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Avg signal:</span>
            <span className="font-mono font-semibold text-slate-200">
              {metrics.averageSignalScore} / 100
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
