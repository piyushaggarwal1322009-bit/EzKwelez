/**
 * ConnectivityCard Component
 * Displays location-specific Wi-Fi/network connectivity telemetry.
 * Quality derived centrally from calculations.ts.
 * Note: Telemetry represents campus access point sensors, NOT client browser measurements.
 * Owner: Tanisha
 */

import * as React from 'react';
import { ConnectivitySnapshot, CampusLocation } from '../types/campus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatConnectivityQuality,
  getConnectivityQualityVariant,
  formatRelativeTime,
} from '../lib/calculations';
import { Wifi, MapPin, Clock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConnectivityCardProps {
  connectivity: ConnectivitySnapshot;
  locationDetails?: CampusLocation;
  className?: string;
}

export function ConnectivityCard({
  connectivity,
  locationDetails,
  className,
}: ConnectivityCardProps) {
  const qualityLabel = formatConnectivityQuality(connectivity.quality);
  const qualityVariant = getConnectivityQualityVariant(connectivity.quality);

  // Signal bars representation (0 to 4 bars)
  const activeBars = Math.min(
    4,
    Math.max(0, Math.ceil((connectivity.signalScore / 100) * 4))
  );

  return (
    <Card
      className={cn(
        'bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-white tracking-tight">
              {connectivity.locationName}
            </CardTitle>
            {locationDetails?.zone && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" aria-hidden="true" />
                <span>{locationDetails.zone}</span>
              </div>
            )}
          </div>
          <Badge variant={qualityVariant} className="uppercase text-[10px] tracking-wider font-mono font-bold">
            {qualityLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Signal Score & Bars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Wifi className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-white">
                  {connectivity.signalScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <span className="text-[11px] text-slate-400">AP Telemetry Score</span>
            </div>
          </div>

          {/* 4-Bar Signal Indicator */}
          <div
            className="flex items-end gap-1 h-6 px-2 py-1 bg-slate-950/60 rounded border border-slate-800"
            role="img"
            aria-label={`Signal strength: ${activeBars} out of 4 bars, ${qualityLabel}`}
          >
            {[1, 2, 3, 4].map((barIndex) => {
              const isFilled = barIndex <= activeBars;
              const barHeights = ['h-1.5', 'h-2.5', 'h-3.5', 'h-5'];
              return (
                <div
                  key={barIndex}
                  className={cn(
                    'w-1.5 rounded-sm transition-colors',
                    barHeights[barIndex - 1],
                    isFilled
                      ? connectivity.quality === 'excellent' || connectivity.quality === 'good'
                        ? 'bg-emerald-400'
                        : connectivity.quality === 'fair'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                      : 'bg-slate-800'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Technical Details: dBm and SSID */}
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Server className="w-3 h-3 text-slate-400" aria-hidden="true" />
              SSID:
            </span>
            <span className="text-slate-200 truncate max-w-[170px]">
              {connectivity.networkName || 'CAMPUS-WLAN'}
            </span>
          </div>
          {connectivity.signalDbm !== undefined && (
            <div className="flex items-center justify-between text-slate-400">
              <span>RSSI Signal:</span>
              <span className="text-slate-200">{connectivity.signalDbm} dBm</span>
            </div>
          )}
        </div>

        {/* Footer timestamp & source disclaimer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
            {formatRelativeTime(connectivity.measuredAt)}
          </span>
          <span className="text-[10px] text-slate-400" title="Telemetry sourced from campus access point controllers">
            Infrastructure AP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
