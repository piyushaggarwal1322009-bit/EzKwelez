import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { LiveCampusConditions } from "@/features/tanisha";
import { APP_NAME, DataMode } from "@ezykwelez/shared";

export default function LiveCampusPage() {
  return (
    <AppLayout
      title={`Live Campus Conditions — ${APP_NAME}`}
      description="Live Campus Conditions, occupancy metrics, signal telemetry, and operational rankings."
      dataMode={DataMode.SIMULATED}
    >
      <PageHeader
        title="Live Conditions Feed"
        description="Comprehensive real-time telemetry feed across campus facilities."
        breadcrumbs={[{ label: "Live Conditions" }]}
      />
      <LiveCampusConditions />
    </AppLayout>
  );
}
