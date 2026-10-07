import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkApiHealth } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/config";
import {
  Activity,
  CheckCircle2,
  Database,
  Lock,
  RefreshCw,
  Server,
  Settings as SettingsIcon,
  Shield,
  Sliders,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const [healthInfo, setHealthInfo] = React.useState<any>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [refreshInterval, setRefreshInterval] = React.useState("10");

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const data = await checkApiHealth();
      setHealthInfo(data);
    } catch {
      setHealthInfo({ status: "offline", service: "ezykwelez-api" });
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    checkHealth();
  }, []);

  return (
    <AppLayout
      title="System Settings & Diagnostics"
      description="Configure telemetry refresh parameters, inspect backend API readiness, and review role boundaries."
    >
      <PageHeader
        title="Settings & System Diagnostics"
        description="Operational engine configuration, telemetry intervals, and backend connectivity diagnostics."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <div className="space-y-6 max-w-4xl">
        {/* API Backend Diagnostics Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" /> Backend Service Health
              </CardTitle>
              <CardDescription>FastAPI modular monolith connection status</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              isLoading={isChecking}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Ping API
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Service Name</span>
                <span className="font-mono text-slate-200">{healthInfo?.service || "ezykwelez-api"}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Engine Status</span>
                <span className="font-mono font-semibold flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      healthInfo?.status === "healthy" || healthInfo?.status === "online"
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span
                    className={
                      healthInfo?.status === "healthy" || healthInfo?.status === "online"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {healthInfo?.status?.toUpperCase() || "CHECKING"}
                  </span>
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">API Base URL</span>
                <span className="font-mono text-slate-300 truncate block">
                  {API_BASE_URL}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Polling Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Telemetry Refresh Configuration
            </CardTitle>
            <CardDescription>Control live background refresh frequency for campus conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1 max-w-sm">
              <label className="block text-slate-300 font-medium">Auto-Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="5">Every 5 Seconds (High Frequency)</option>
                <option value="10">Every 10 Seconds (Recommended)</option>
                <option value="30">Every 30 Seconds (Normal)</option>
                <option value="60">Every 60 Seconds (Low Bandwidth)</option>
                <option value="0">Manual Only (No Auto-Poll)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security & Role Boundaries Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Role & Permission Boundaries
            </CardTitle>
            <CardDescription>Authoritative authorization policy enforcement overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Student / Viewer</span>
                <p className="text-[11px] text-slate-400">
                  Read-only visibility into live room occupancy, Wi-Fi scores, and published class updates.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Campus Operator</span>
                <p className="text-[11px] text-slate-400">
                  Full authority to report disruptions, run blast-radius calculations, and execute state transitions.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Administrator</span>
                <p className="text-[11px] text-slate-400">
                  Authority to approve/reject recovery plans and modify critical dependency topology.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
