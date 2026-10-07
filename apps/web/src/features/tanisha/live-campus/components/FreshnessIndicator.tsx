/**
 * FreshnessIndicator Component
 * Displays human-readable data age and status (Fresh, Stale, Unavailable)
 * Owner: Tanisha
 */

import * as React from 'react';
import { Freshness } from '../types/campus';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FreshnessIndicatorProps {
  freshness: Freshness;
  formattedTime: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function FreshnessIndicator({
  freshness,
  formattedTime,
  onRefresh,
  isRefreshing = false,
  className,
}: FreshnessIndicatorProps) {
  const getStatusConfig = () => {
    switch (freshness) {
      case 'fresh':
        return {
          label: 'Fresh',
          dotColor: 'bg-emerald-400',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-800/40',
          bg: 'bg-emerald-950/20',
        };
      case 'stale':
        return {
          label: 'Stale',
          dotColor: 'bg-amber-400 animate-pulse',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-800/50',
          bg: 'bg-amber-950/30',
        };
      case 'unavailable':
      default:
        return {
          label: 'Unavailable',
          dotColor: 'bg-rose-400',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-800/50',
          bg: 'bg-rose-950/30',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 px-3 py-1.5 rounded-lg border text-xs',
        config.borderColor,
        config.bg,
        className
      )}
      role="region"
      aria-label={`Data freshness: ${config.label}, ${formattedTime}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn('inline-block w-2 h-2 rounded-full', config.dotColor)}
          aria-hidden="true"
        />
        <span className={cn('font-semibold uppercase tracking-wider text-[11px]', config.textColor)}>
          {config.label}
        </span>
      </div>

      <div className="h-3 w-px bg-slate-700/60" aria-hidden="true" />

      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
        {freshness === 'unavailable' ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
        )}
        <span>{formattedTime}</span>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh campus conditions telemetry"
          className={cn(
            'ml-1 p-1 rounded hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500',
            isRefreshing && 'opacity-60 cursor-not-allowed'
          )}
        >
          <RefreshCw
            className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-blue-400')}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
