/**
 * OccupancyCard Component
 * Displays single campus location occupancy snapshot with progress indicator,
 * accessible progress bar, count / capacity, and threshold status badge.
 * Owner: Tanisha
 */

import * as React from 'react';
import { OccupancySnapshot, CampusLocation } from '../types/campus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatOccupancyStatus,
  getOccupancyStatusVariant,
  formatRelativeTime,
} from '../lib/calculations';
import { Users, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OccupancyCardProps {
  occupancy: OccupancySnapshot;
  locationDetails?: CampusLocation;
  className?: string;
}

export function OccupancyCard({
  occupancy,
  locationDetails,
  className,
}: OccupancyCardProps) {
  const statusLabel = formatOccupancyStatus(occupancy.status);
  const statusVariant = getOccupancyStatusVariant(occupancy.status);

  // Determine progress bar fill color based on status
  const getProgressColor = () => {
    switch (occupancy.status) {
      case 'low':
        return 'bg-emerald-500';
      case 'moderate':
        return 'bg-blue-500';
      case 'busy':
        return 'bg-amber-500';
      case 'very_busy':
      case 'over_capacity':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  const clampedPercentage = Math.min(100, Math.max(0, occupancy.percentage));

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
              {occupancy.locationName}
            </CardTitle>
            {locationDetails?.zone && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" aria-hidden="true" />
                <span>
                  {locationDetails.zone}
                  {locationDetails.floor ? ` • ${locationDetails.floor}` : ''}
                </span>
              </div>
            )}
          </div>
          <Badge variant={statusVariant} className="uppercase text-[10px] tracking-wider font-mono font-bold">
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Counts */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <Users className="w-4 h-4 text-slate-400 self-center" aria-hidden="true" />
            <span className="text-2xl font-bold font-mono text-white">
              {occupancy.currentCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {occupancy.capacity} max
            </span>
          </div>
          <div className="text-right">
            <span
              className={cn(
                'text-lg font-extrabold font-mono',
                occupancy.percentage >= 90
                  ? 'text-rose-400'
                  : occupancy.percentage >= 75
                  ? 'text-amber-400'
                  : 'text-slate-200'
              )}
            >
              {occupancy.percentage}%
            </span>
          </div>
        </div>

        {/* Accessible Progress Bar */}
        <div className="space-y-1.5">
          <div
            className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={occupancy.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${occupancy.locationName} occupancy at ${occupancy.percentage} percent capacity`}
          >
            <div
              className={cn('h-full transition-all duration-500 rounded-full', getProgressColor())}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0%</span>
            <span>Threshold: 75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Footer timestamp & mode */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
            {formatRelativeTime(occupancy.measuredAt)}
          </span>
          <span className="uppercase text-[10px] tracking-widest font-mono text-slate-400">
            {occupancy.dataMode}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
