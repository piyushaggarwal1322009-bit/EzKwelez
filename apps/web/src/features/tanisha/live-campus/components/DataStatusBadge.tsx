/**
 * DataStatusBadge Component
 * Displays transparent indication of telemetry mode.
 * STRICT REQUIREMENT: Clearly displays "SIMULATED DATA" when running synthetic data.
 * Owner: Tanisha
 */

import * as React from 'react';
import { DataMode } from '../types/campus';
import { Badge } from '@/components/ui/badge';
import { Radio, Activity, Cpu, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataStatusBadgeProps {
  dataMode: DataMode;
  className?: string;
  size?: 'sm' | 'md';
}

export function DataStatusBadge({
  dataMode,
  className,
  size = 'md',
}: DataStatusBadgeProps) {
  switch (dataMode) {
    case 'simulated':
      return (
        <Badge
          variant="warning"
          className={cn(
            'flex items-center gap-1.5 font-mono tracking-wider font-bold uppercase shadow-sm',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            className
          )}
          role="status"
          aria-label="Data mode: Simulated data"
        >
          <Cpu className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>SIMULATED DATA</span>
        </Badge>
      );

    case 'live':
      return (
        <Badge
          variant="success"
          className={cn(
            'flex items-center gap-1.5 font-mono tracking-wider font-bold uppercase shadow-sm',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            className
          )}
          role="status"
          aria-label="Data mode: Live telemetry"
        >
          <Radio className={cn('animate-pulse', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} aria-hidden="true" />
          <span>LIVE TELEMETRY</span>
        </Badge>
      );

    case 'estimated':
      return (
        <Badge
          variant="outline"
          className={cn(
            'flex items-center gap-1.5 font-mono tracking-wider font-bold uppercase border-cyan-800 text-cyan-300 bg-cyan-950/40',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            className
          )}
          role="status"
          aria-label="Data mode: Estimated data"
        >
          <Activity className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>ESTIMATED</span>
        </Badge>
      );

    case 'unknown':
    default:
      return (
        <Badge
          variant="default"
          className={cn(
            'flex items-center gap-1.5 font-mono tracking-wider text-slate-400',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            className
          )}
          role="status"
          aria-label="Data mode: Unknown source"
        >
          <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>UNKNOWN SOURCE</span>
        </Badge>
      );
  }
}
