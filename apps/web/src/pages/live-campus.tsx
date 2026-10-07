/**
 * Dedicated Testing & Demonstration Route for Live Campus Conditions
 * Route: /live-campus
 * Owner: Tanisha
 *
 * Provides a standalone testbed for reviewing Live Campus Conditions
 * without modifying index.tsx or touching Ishu's feature directories.
 */

import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LiveCampusConditions } from '@/features/tanisha/live-campus';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield } from 'lucide-react';
import { APP_NAME } from '@ezykwelez/shared';

export default function LiveCampusPage() {
  return (
    <>
      <Head>
        <title>{`${APP_NAME} — Live Campus Conditions`}</title>
        <meta
          name="description"
          content="Campus operations command center live conditions, occupancy tracking, and wireless telemetry."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="max-w-7xl w-full space-y-6">
          {/* Top Operational Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Back to Root
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-800 text-blue-400 font-mono text-[11px]">
                  Feature: Live Campus Conditions
                </Badge>
                <Badge variant="default" className="text-slate-400 font-mono text-[11px]">
                  Owner: Tanisha
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span>Independent Feature Boundary</span>
            </div>
          </div>

          {/* Embedded Reusable Live Campus Conditions Module */}
          <LiveCampusConditions
            autoRefreshIntervalMs={0}
            showSimulationControls={true}
          />
        </div>
      </main>
    </>
  );
}
