import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Dialog } from "@/components/ui/dialog";
import { incidentService } from "@/services/incident-service";
import { campusService } from "@/services/campus-service";
import { graphService } from "@/services/graph-service";
import {
  CampusLocation,
  DependencyNode,
  Incident,
  IncidentStatus,
  IncidentUpdate,
} from "@ezykwelez/shared";
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  GitFork,
  Radio,
  RotateCw,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function IncidentDetailPage() {
  const router = useRouter();
  const { incidentId } = router.query;

  const [incident, setIncident] = React.useState<Incident | null>(null);
  const [updates, setUpdates] = React.useState<IncidentUpdate[]>([]);
  const [location, setLocation] = React.useState<CampusLocation | null>(null);
  const [rootNode, setRootNode] = React.useState<DependencyNode | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Transition Dialog State
  const [isTransitionOpen, setIsTransitionOpen] = React.useState(false);
  const [targetStatus, setTargetStatus] = React.useState<IncidentStatus>(IncidentStatus.INVESTIGATING);
  const [transitionMessage, setTransitionMessage] = React.useState("");
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!incidentId || typeof incidentId !== "string") return;
    try {
      setError(null);
      const [incRes, updatesRes] = await Promise.all([
        incidentService.getIncident(incidentId),
        incidentService.getIncidentUpdates(incidentId),
      ]);

      setIncident(incRes);
      setUpdates(updatesRes);

      if (incRes.locationId) {
        campusService.getLocations().then((locs) => {
          setLocation(locs.find((l) => l.id === incRes.locationId) || null);
        });
      }
      if (incRes.rootNodeId) {
        graphService.getNode(incRes.rootNodeId).then((node) => {
          setRootNode(node);
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load incident record.");
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;

    setIsTransitioning(true);
    try {
      const updated = await incidentService.transitionIncident(incident.id, {
        targetStatus,
        actorId: "campus_operations_lead",
        message: transitionMessage || undefined,
      });
      setIncident(updated);
      setIsTransitionOpen(false);
      setTransitionMessage("");
      // Refresh audit updates
      const newUpdates = await incidentService.getIncidentUpdates(incident.id);
      setUpdates(newUpdates);
    } catch (err: any) {
      alert(`Transition rejected by state machine: ${err.message}`);
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading Incident Details...">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !incident) {
    return (
      <AppLayout title="Incident Not Found">
        <PageHeader
          title="Disruption Record"
          breadcrumbs={[{ label: "Incidents", href: "/incidents" }, { label: "Details" }]}
        />
        <ErrorState
          title="Incident Record Inaccessible"
          message={error || "Requested incident does not exist in the database."}
          onRetry={fetchData}
        />
      </AppLayout>
    );
  }

  // Convert IncidentUpdate to Timeline items
  const timelineItems: TimelineItem[] = updates.map((u) => ({
    id: u.id,
    timestamp: u.createdAt,
    title:
      u.type === "created"
        ? "Incident Formally Reported"
        : u.type === "status_changed"
        ? `Status Transition: ${u.statusBefore} → ${u.statusAfter}`
        : u.type === "mitigated"
        ? "Mitigation Measure Deployed"
        : u.type === "resolved"
        ? "Disruption Fully Resolved"
        : "Incident Update Recorded",
    description: u.message,
    actor: u.createdBy,
    variant:
      u.statusAfter === "active"
        ? "critical"
        : u.statusAfter === "resolved"
        ? "success"
        : u.statusAfter === "mitigated"
        ? "warning"
        : "default",
  }));

  return (
    <AppLayout
      title={`${incident.title} - Details`}
      description={incident.description}
      onRefresh={fetchData}
    >
      <PageHeader
        title={incident.title}
        description={`ID: ${incident.id} • Started: ${new Date(incident.startedAt).toLocaleString()}`}
        breadcrumbs={[
          { label: "Incidents", href: "/incidents" },
          { label: incident.title },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <Badge
              variant={
                incident.severity === "critical"
                  ? "critical"
                  : incident.severity === "high"
                  ? "high"
                  : incident.severity === "moderate"
                  ? "moderate"
                  : "low"
              }
            >
              {incident.severity.toUpperCase()}
            </Badge>
            <StatusIndicator status={incident.status} showPulse={incident.status === "active"} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/incidents">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to List
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTransitionOpen(true)}
              className="gap-1.5 text-xs"
            >
              <RotateCw className="w-3.5 h-3.5" /> Change Status
            </Button>
            {incident.rootNodeId && (
              <Link href={`/impact?incidentId=${incident.id}&rootNodeId=${incident.rootNodeId}`}>
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-cyan-300">
                  <AlertOctagon className="w-3.5 h-3.5" /> Blast Radius
                </Button>
              </Link>
            )}
            <Link href={`/recovery?incidentId=${incident.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" /> Recovery Options
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description, Milestones, and Affected Systems */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Disruption Summary</CardTitle>
              <CardDescription>Official operational description and classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-200 leading-relaxed">{incident.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {incident.type.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Source</span>
                  <span className="font-semibold text-slate-200 capitalize">{incident.source}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Provenance Mode</span>
                  <span className="font-semibold text-cyan-400 font-mono capitalize">
                    {incident.dataMode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current Status</span>
                  <span className="font-semibold text-slate-200 capitalize">{incident.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Domain Reference Links */}
          <Card>
            <CardHeader>
              <CardTitle>Affected Campus Topology</CardTitle>
              <CardDescription>Primary facility and root dependency node links</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Building2 className="w-4 h-4 text-blue-400" /> Primary Location
                </div>
                {location ? (
                  <div className="space-y-1">
                    <Link
                      href={`/campus/${location.id}`}
                      className="text-xs font-medium text-blue-400 hover:underline block"
                    >
                      {location.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Code: {location.code || "LOC-GEN"} • Capacity: {location.capacity || 0}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Unspecified campus-wide area</span>
                )}
              </div>

              {/* Root Node Card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <GitFork className="w-4 h-4 text-purple-400" /> Root Topology Node
                </div>
                {rootNode ? (
                  <div className="space-y-2">
                    <Link
                      href={`/dependencies`}
                      className="text-xs font-medium text-purple-400 hover:underline block"
                    >
                      {rootNode.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Type: {rootNode.type.toUpperCase()} • Criticality: {rootNode.criticality}
                    </span>
                    <Link
                      href={`/impact?incidentId=${incident.id}&rootNodeId=${rootNode.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition pt-1"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" /> Analyze Blast Radius &rarr;
                    </Link>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No root system linked</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone Timestamps</CardTitle>
              <CardDescription>State-machine milestone timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Detected At</span>
                  <span className="font-mono text-slate-200">
                    {new Date(incident.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Acknowledged At</span>
                  <span className="font-mono text-slate-200">
                    {incident.acknowledgedAt
                      ? new Date(incident.acknowledgedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Pending"}
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Resolved At</span>
                  <span className="font-mono text-slate-200">
                    {incident.resolvedAt
                      ? new Date(incident.resolvedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Unresolved"}
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Closed At</span>
                  <span className="font-mono text-slate-200">
                    {incident.closedAt
                      ? new Date(incident.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Open"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Immutable Chronological Audit Trail */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit History</CardTitle>
                <CardDescription>Immutable chronological event trail</CardDescription>
              </div>
              <span className="text-xs font-mono text-slate-500">{updates.length} logs</span>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* State Machine Transition Dialog */}
      <Dialog
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        title="Execute Lifecycle Transition"
        description="Advances the state machine according to strict transition graph rules."
      >
        <form onSubmit={handleExecuteTransition} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Status *</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as IncidentStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 capitalize"
            >
              {Object.values(IncidentStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Transition Reason / Notes</label>
            <textarea
              rows={3}
              placeholder="e.g., Assigned technician to breaker lockout investigation..."
              value={transitionMessage}
              onChange={(e) => setTransitionMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsTransitionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isTransitioning}>
              Confirm State Change
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
