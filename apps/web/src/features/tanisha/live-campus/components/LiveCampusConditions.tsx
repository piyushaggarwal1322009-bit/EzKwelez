/**
 * LiveCampusConditions Main Feature Component
 * Clean, high-density campus operations command center view.
 * Handles loading, error, empty, stale, and nominal states.
 * Owner: Tanisha
 */

import * as React from 'react';
import { useLiveCampusConditions, SimulationMode } from '../hooks/useLiveCampusConditions';
import { CampusOverview } from './CampusOverview';
import { OccupancyCard } from './OccupancyCard';
import { ConnectivityCard } from './ConnectivityCard';
import { LocationRanking } from './LocationRanking';
import { DataStatusBadge } from './DataStatusBadge';
import { FreshnessIndicator } from './FreshnessIndicator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Activity,
  Layers,
  Users,
  Wifi,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LiveCampusConditionsProps {
  className?: string;
  autoRefreshIntervalMs?: number;
  initialSimulationMode?: SimulationMode;
  showSimulationControls?: boolean;
}

export function LiveCampusConditions({
  className,
  autoRefreshIntervalMs = 0,
  initialSimulationMode = 'normal',
  showSimulationControls = true,
}: LiveCampusConditionsProps) {
  const {
    data,
    isLoading,
    error,
    metrics,
    combinedConditions,
    mostCrowded,
    weakestConnectivity,
    freshness,
    formattedLastUpdated,
    simulationMode,
    setSimulationMode,
    refresh,
  } = useLiveCampusConditions({
    autoRefreshIntervalMs,
    initialMode: initialSimulationMode,
  });

  const [activeTab, setActiveTab] = React.useState<'all' | 'occupancy' | 'connectivity'>('all');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <div className={cn('space-y-6 w-full text-slate-100', className)}>
      {/* ========================================================= */}
      {/* HEADER & OPERATIONAL CONTROLS                             */}
      {/* ========================================================= */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" aria-hidden="true" />
              Live Campus Conditions
            </h2>
            {data && <DataStatusBadge dataMode={data.dataMode} />}
          </div>
          <p className="text-xs text-slate-400">
            Real-time occupancy density and AP wireless telemetry across campus operational zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FreshnessIndicator
            freshness={freshness}
            formattedTime={formattedLastUpdated}
            onRefresh={handleManualRefresh}
            isRefreshing={isRefreshing || isLoading}
          />

          {showSimulationControls && (
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Sliders className="w-3.5 h-3.5 text-slate-500 ml-1.5" aria-hidden="true" />
              <label htmlFor="simulation-mode-select" className="sr-only">
                Telemetry State Simulator
              </label>
              <select
                id="simulation-mode-select"
                value={simulationMode}
                onChange={(e) => setSimulationMode(e.target.value as SimulationMode)}
                className="bg-transparent text-slate-300 text-xs font-mono py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                aria-label="Simulation state mode selector"
              >
                <option value="normal" className="bg-slate-900 text-slate-200">
                  Mode: Nominal Simulated
                </option>
                <option value="stale" className="bg-slate-900 text-slate-200">
                  Mode: Stale Telemetry
                </option>
                <option value="error" className="bg-slate-900 text-slate-200">
                  Mode: API Failure (503)
                </option>
                <option value="empty" className="bg-slate-900 text-slate-200">
                  Mode: Empty Telemetry
                </option>
              </select>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* STALE TELEMETRY BANNER                                    */}
      {/* ========================================================= */}
      {freshness === 'stale' && !isLoading && !error && (
        <div
          role="alert"
          className="flex items-center justify-between p-3.5 rounded-lg border border-amber-800/60 bg-amber-950/40 text-amber-300 text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <strong className="font-semibold uppercase tracking-wider text-[11px]">
                Telemetry Stream Stale:
              </strong>{' '}
              <span>
                Campus sensors have not pushed updates within nominal window ({formattedLastUpdated}).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-xs font-medium transition-colors"
          >
            Poll Sensors
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* ERROR STATE                                               */}
      {/* ========================================================= */}
      {error && !isLoading && (
        <Card className="bg-rose-950/20 border-rose-900/60 p-6 text-center" role="alert">
          <CardHeader className="items-center pb-2">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-2">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-rose-200 text-lg">Telemetry Stream Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-rose-300 font-mono bg-rose-950/60 p-2.5 rounded border border-rose-900/40">
              {error}
            </p>
            <p className="text-xs text-slate-400">
              The live campus telemetry feed could not be reached. You can retry retrieval or switch to nominal simulated mode.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSimulationMode('normal')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Reset to Nominal
              </button>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Feed
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* LOADING STATE                                             */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-6" aria-busy="true" aria-label="Loading campus conditions">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse p-4" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EMPTY DATA STATE                                          */}
      {/* ========================================================= */}
      {!isLoading && !error && combinedConditions.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center">
          <CardContent className="space-y-3 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-white">No Monitored Locations</h3>
            <p className="text-xs text-slate-400">
              No campus location condition records were returned by the active telemetry stream.
            </p>
            <button
              type="button"
              onClick={() => setSimulationMode('normal')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Load Sample Data
            </button>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* NOMINAL DATA CONTENT                                      */}
      {/* ========================================================= */}
      {!isLoading && !error && combinedConditions.length > 0 && (
        <>
          {/* 1. CAMPUS OVERVIEW METRICS */}
          {metrics && <CampusOverview metrics={metrics} />}

          {/* 2. DUAL OPERATIONAL RANKINGS */}
          <LocationRanking
            mostCrowded={mostCrowded}
            weakestConnectivity={weakestConnectivity}
          />

          {/* 3. VIEW MODE NAVIGATION TABS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 self-start">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                aria-pressed={activeTab === 'all'}
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                All Conditions ({combinedConditions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('occupancy')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'occupancy'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                aria-pressed={activeTab === 'occupancy'}
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                Occupancy Grid
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('connectivity')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'connectivity'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                aria-pressed={activeTab === 'connectivity'}
              >
                <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                Connectivity Grid
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Displaying {combinedConditions.length} active zones
            </div>
          </div>

          {/* 4. DETAIL CARDS PRESENTATION */}
          {activeTab === 'occupancy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedConditions
                .filter((item) => item.occupancy !== undefined)
                .map((item) => (
                  <OccupancyCard
                    key={item.location.id}
                    occupancy={item.occupancy!}
                    locationDetails={item.location}
                  />
                ))}
            </div>
          )}

          {activeTab === 'connectivity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedConditions
                .filter((item) => item.connectivity !== undefined)
                .map((item) => (
                  <ConnectivityCard
                    key={item.location.id}
                    connectivity={item.connectivity!}
                    locationDetails={item.location}
                  />
                ))}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combinedConditions.map((item) => (
                <div
                  key={item.location.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {item.location.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {item.location.zone || 'Campus Zone'} • Capacity: {item.location.capacity}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.location.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.occupancy ? (
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            Occupancy
                          </span>
                          <span className="font-mono font-bold text-white">
                            {item.occupancy.percentage}%
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-300">
                          {item.occupancy.currentCount} / {item.occupancy.capacity} students
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              item.occupancy.percentage >= 90
                                ? 'bg-rose-500'
                                : item.occupancy.percentage >= 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, item.occupancy.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-center">
                        No occupancy sensor
                      </div>
                    )}

                    {item.connectivity ? (
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                            Wi-Fi Signal
                          </span>
                          <span className="font-mono font-bold text-white">
                            {item.connectivity.signalScore}/100
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-300 truncate">
                          {item.connectivity.networkName || 'WLAN'}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Quality:</span>
                          <span className="capitalize font-semibold text-slate-200">
                            {item.connectivity.quality.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-center">
                        No AP telemetry
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
