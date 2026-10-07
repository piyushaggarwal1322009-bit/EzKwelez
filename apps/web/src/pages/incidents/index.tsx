import * as React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { incidentService } from "@/services/incident-service";
import { campusService } from "@/services/campus-service";
import { graphService } from "@/services/graph-service";
import {
  CampusLocation,
  CreateIncidentRequest,
  DataMode,
  DependencyNode,
  Incident,
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
  IncidentType,
} from "@ezykwelez/shared";
import {
  AlertOctagon,
  ArrowRight,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [locations, setLocations] = React.useState<CampusLocation[]>([]);
  const [nodes, setNodes] = React.useState<DependencyNode[]>([]);
  const [affectedNodeIds, setAffectedNodeIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");

  // Create Incident Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<CreateIncidentRequest>({
    title: "",
    description: "",
    type: IncidentType.POWER_OUTAGE,
    severity: IncidentSeverity.HIGH,
    source: IncidentSource.MANUAL,
    status: IncidentStatus.REPORTED,
    locationId: "",
    rootNodeId: "",
    dataMode: DataMode.SIMULATED,
    estimatedDurationMinutes: 90,
  });

  const fetchData = async () => {
    try {
      setError(null);
      const [incidentsRes, locationsRes, nodesRes] = await Promise.all([
        incidentService.listIncidents(),
        campusService.getLocations(),
        graphService.listNodes(),
      ]);
      setIncidents(incidentsRes);
      setLocations(locationsRes);
      setNodes(nodesRes);
    } catch (err: any) {
      setError(err.message || "Failed to load campus incident records.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !(createForm.description || "").trim()) return;
    if (affectedNodeIds.length === 0) {
      alert("Select at least one directly affected campus entity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const campusId = locations[0]?.campusId;
      if (!campusId) throw new Error("No campus is available for incident creation.");
      const idempotencyKey = `idemp_web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const created = await incidentService.createCampusIncident(
        campusId,
        {
          ...createForm,
          locationId: createForm.locationId || undefined,
          rootNodeId: createForm.rootNodeId || undefined,
        },
        idempotencyKey
      );
      await Promise.all(
        affectedNodeIds.map((nodeId) =>
          incidentService.addAffectedEntity(created.id, {
            nodeId,
            reason: createForm.description || created.title,
          })
        )
      );
      setIncidents((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setAffectedNodeIds([]);
      setCreateForm({
        title: "",
        description: "",
        type: IncidentType.POWER_OUTAGE,
        severity: IncidentSeverity.HIGH,
        source: IncidentSource.MANUAL,
        status: IncidentStatus.REPORTED,
        locationId: "",
        rootNodeId: "",
        dataMode: DataMode.SIMULATED,
        estimatedDurationMinutes: 90,
      });
    } catch (err: any) {
      alert(`Incident creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || inc.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidents, searchQuery, statusFilter, severityFilter]);

  return (
    <AppLayout
      title="Incident & Disruption Management"
      description="Report, triage, and track operational disruptions across campus facilities and infrastructure."
      onRefresh={fetchData}
    >
      <PageHeader
        title="Incident & Disruption Management"
        description="Authoritative operational disruption registry governing state-machine lifecycles, blast radius estimation, and audit trails."
        breadcrumbs={[{ label: "Incidents" }]}
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Report New Disruption
          </Button>
        }
      />

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident title, description, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <span className="text-[11px] text-slate-400 px-1">Status:</span>
            {["all", "active", "investigating", "triaged", "resolved", "closed", "cancelled"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded text-xs capitalize whitespace-nowrap font-medium transition-colors ${
                  statusFilter === s ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <span className="text-[11px] text-slate-400 px-1">Severity:</span>
            {["all", "critical", "high", "moderate", "low", "info"].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 rounded text-xs capitalize whitespace-nowrap font-medium transition-colors ${
                  severityFilter === sev ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List */}
      {error ? (
        <ErrorState title="Incident Stream Offline" message={error} onRetry={fetchData} />
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          title="No Incidents Match Filters"
          description="There are currently no active or historical disruptions matching your query."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setSeverityFilter("all");
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const locName = locations.find((l) => l.id === incident.locationId)?.name;
            const nodeName = nodes.find((n) => n.id === incident.rootNodeId)?.name;

            return (
              <Card
                key={incident.id}
                className="hover:border-slate-700 transition-all bg-slate-900/70 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="text-base font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {incident.title}
                      </Link>
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
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                      {incident.description}
                    </p>
                  </div>

                  <StatusIndicator status={incident.status} showPulse={incident.status === "active"} />
                </div>

                {/* Metadata & Affected Reference tags */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap">
                  <span>
                    Category: <strong className="text-slate-200 capitalize">{incident.type.replace("_", " ")}</strong>
                  </span>
                  <span>
                    Source: <strong className="text-slate-200 capitalize">{incident.source}</strong>
                  </span>
                  {locName && (
                    <span>
                      Location: <strong className="text-slate-200">{locName}</strong>
                    </span>
                  )}
                  {nodeName && (
                    <span>
                      Root System: <strong className="text-slate-200">{nodeName}</strong>
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[11px] text-slate-500">
                    Detected: {new Date(incident.detectedAt).toLocaleString()}
                  </span>
                </div>

                {/* Direct Action triggers */}
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/incidents/${incident.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Inspect Timeline & Audit
                    </Button>
                  </Link>
                  {incident.rootNodeId && (
                    <Link href={`/impact?incidentId=${incident.id}&rootNodeId=${incident.rootNodeId}`}>
                      <Button variant="secondary" size="sm" className="text-xs text-cyan-300 gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Analyze Blast Radius
                      </Button>
                    </Link>
                  )}
                  <Link href={`/recovery?incidentId=${incident.id}`}>
                    <Button variant="primary" size="sm" className="text-xs gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Recovery Decision Support
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report Disruption Modal Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Report New Campus Disruption"
        description="Creates an authoritative incident record and establishes inputs for blast-radius calculations."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Incident Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Main Power Substation Feeder Trip"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe what failed, observed symptoms, and immediate impact..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Disruption Type</label>
              <select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as IncidentType })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 capitalize"
              >
                {Object.values(IncidentType).map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Severity Scale</label>
              <select
                value={createForm.severity}
                onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value as IncidentSeverity })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 uppercase"
              >
                {Object.values(IncidentSeverity).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Affected Location (Optional)</label>
              <select
                value={createForm.locationId || ""}
                onChange={(e) => setCreateForm({ ...createForm, locationId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Campus Wide / Unspecified --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Root Topology Node (Optional)</label>
              <select
                value={createForm.rootNodeId || ""}
                onChange={(e) => setCreateForm({ ...createForm, rootNodeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Root System --</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Estimated Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={createForm.estimatedDurationMinutes || ""}
              onChange={(e) => setCreateForm({
                ...createForm,
                estimatedDurationMinutes: e.target.value ? Number(e.target.value) : undefined,
              })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-slate-300 font-medium">Directly Affected Entities *</legend>
            <p className="text-[11px] text-slate-500">
              Only selected entities are marked; downstream effects are not inferred.
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1 rounded border border-slate-800 bg-slate-950 p-2">
              {nodes
                .filter((node) => ["building", "room", "resource", "service"].includes(node.type))
                .map((node) => (
                  <label key={node.id} className="flex items-center gap-2 py-1 text-slate-200">
                    <input
                      type="checkbox"
                      checked={affectedNodeIds.includes(node.id)}
                      onChange={(event) => setAffectedNodeIds((current) =>
                        event.target.checked
                          ? [...current, node.id]
                          : current.filter((id) => id !== node.id)
                      )}
                    />
                    <span>{node.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-slate-500">{node.type}</span>
                  </label>
                ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" size="sm" isLoading={isSubmitting}>
              Submit Incident Report
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
