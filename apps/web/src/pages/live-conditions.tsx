import * as React from "react";
import Head from "next/head";
import { LiveCampusConditions } from "@/features/tanisha";
import { APP_NAME } from "@ezykwelez/shared";

export default function LiveCampusPage() {
  return (
    <>
      <Head>
        <title>{`Live Campus Conditions — ${APP_NAME}`}</title>
        <meta
          name="description"
          content="Live Campus Conditions, occupancy metrics, signal telemetry, and operational rankings."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <LiveCampusConditions />
      </main>
    </>
  );
}
