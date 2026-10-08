import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { recoveryService } from "@/services/recovery-service";
import { incidentService } from "@/services/incident-service";
import {
  ConfidenceLevel,
  Feasibility,
  Incident,
  PlanStatus,
  RecoveryOption,
  RecoveryPlan,
  TradeoffDirection,
} from "@ezykwelez/shared";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Columns,
  Flame,
  Layers,
  RotateCw,
  Scale,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { DecisionLoopBanner, RecoveryComparisonTable } from "@/components/decision";
import { useToast } from "@/components/ui/toast-provider";

export default function RecoveryPlanningPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const { incidentId: initialIncId } = router.query;

  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = React.useState<string>("");
  const [plan, setPlan] = React.useState<RecoveryPlan | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<RecoveryOption | null>(null);
  const [isCompareMode, setIsCompareMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Review & Approval Dialog State
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<PlanStatus>(PlanStatus.APPROVED);
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  // Fetch incidents list
  React.useEffect(() => {
    incidentService.listIncidents().then((res) => {
      setIncidents(res);
      const targetId = (initialIncId as string) || (res.length > 0 ? res[0].id : "");
      setSelectedIncidentId(targetId);
    });
  }, [initialIncId]);

  // Fetch recovery plan for selected incident
  const fetchPlan = React.useCallback(async (incId: string) => {
    if (!incId) return;
    setIsLoading(true);
    setError(null);
    try {
      const plans = await recoveryService.getPlansForIncident(incId);
      if (plans && plans.length > 0) {
        setPlan(plans[0]);
        if (plans[0].options && plans[0].options.length > 0) {
          setSelectedOption(plans[0].options[0]);
        }
      } else {
        setPlan(null);
        setSelectedOption(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load recovery options.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedIncidentId) {
      fetchPlan(selectedIncidentId);
    }
  }, [selectedIncidentId, fetchPlan]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    setIsSubmittingReview(true);
    try {
      const updated = await recoveryService.reviewPlan(plan.id, {
        status: reviewStatus as any,
        reviewedBy: "Campus Operations Commander (Lead)",
        reviewNotes: reviewNotes || undefined,
      });
      setPlan(updated);
      setIsReviewOpen(false);
      setReviewNotes("");
      showToast({ title: "Review decision saved", variant: "success" });
    } catch (err: any) {
      showToast({
        title: "Review decision failed",
        description: err.message || "The review could not be saved.",
        variant: "error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getFeasibilityBadge = (feasibility: Feasibility) => {
    switch (feasibility) {
      case Feasibility.FEASIBLE:
        return <Badge variant="success">FEASIBLE</Badge>;
      case Feasibility.CONDITIONALLY_FEASIBLE:
        return <Badge variant="warning">CONDITIONALLY FEASIBLE</Badge>;
      case Feasibility.INFEASIBLE:
        return <Badge variant="destructive">INFEASIBLE</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <AppLayout
      title="Recovery Planning & Decision Support"
      description="Constraint-aware candidate generation, trade-off evaluation, and human-in-the-loop plan review."
    >
      <PageHeader
        title="Recovery Planning & Decision Support"
        description="Generates explainable, constraint-checked candidate recovery options to restore campus services following disruptions."
        breadcrumbs={[{ label: "Recovery Planning" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isCompareMode ? "primary" : "outline"}
              size="sm"
              onClick={() => setIsCompareMode(!isCompareMode)}
              className="gap-1.5 text-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              {isCompareMode ? "Exit Comparison" : "Compare Trade-offs"}
            </Button>
            {plan && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewOpen(true)}
                className="gap-1.5 text-xs text-amber-300 border-amber-800/80 bg-amber-950/40"
              >
                <UserCheck className="w-3.5 h-3.5" /> Human Review & Approval
              </Button>
            )}
          </div>
        }
      />

      <DecisionLoopBanner
        currentStep="recovery"
        incidentId={selectedIncidentId}
        className="mb-6"
      />

      {/* Incident Switcher */}
      <Card className="mb-6 border-slate-800 bg-slate-900/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-white block">Active Campus Disruption</span>
              <span className="text-[11px] text-slate-400">Select disruption to view formulated recovery plans</span>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.title} ({inc.severity.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState
          title="Recovery Options Inaccessible"
          message={error}
          onRetry={() => fetchPlan(selectedIncidentId)}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !plan ? (
        <div className="text-center py-12 text-slate-500">No recovery plan generated for this incident.</div>
      ) : (
        <div className="space-y-6">
          {/* Plan Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex-wrap gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Plan Reference: {plan.id}</span>
                <span className="text-xs font-mono text-slate-400">• Version {plan.version}</span>
                <Badge
                  variant={
                    plan.status === PlanStatus.APPROVED
                      ? "success"
                      : plan.status === PlanStatus.REJECTED
                      ? "destructive"
                      : "warning"
                  }
                >
                  {plan.status.toUpperCase().replace("_", " ")}
                </Badge>
              </div>
              {plan.reviewedBy && (
                <div className="text-xs text-slate-400">
                  Reviewed by <strong className="text-slate-200">{plan.reviewedBy}</strong> on{" "}
                  {plan.reviewedAt ? new Date(plan.reviewedAt).toLocaleString() : ""}
                  {plan.reviewNotes && ` — "${plan.reviewNotes}"`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPlan(selectedIncidentId)}
                className="gap-1.5 text-xs text-slate-300"
              >
                <RotateCw className="w-3.5 h-3.5" /> Re-evaluate
              </Button>
            </div>
          </div>

          {/* Warnings if any */}
          {plan.warnings && plan.warnings.length > 0 && (
            <Alert variant="warning" title="Planning & Resource Notices">
              <ul className="list-disc pl-4 space-y-0.5">
                {plan.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Top Recommendation Highlight Card */}
          {plan.options && plan.options.length > 0 && (
            <Card className="border-blue-900/60 bg-gradient-to-r from-blue-950/40 to-slate-900/80">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400 font-mono text-[10px]">
                      TOP RECOMMENDATION • RANK #{plan.options[0].rank || 1}
                    </Badge>
                    {getFeasibilityBadge(plan.options[0].feasibility)}
                  </div>
                  <h3 className="text-base font-semibold text-white">{plan.options[0].title}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl">{plan.options[0].description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOption(plan.options[0]);
                      setIsCompareMode(!isCompareMode);
                    }}
                    className="text-xs flex-1 sm:flex-initial"
                  >
                    {isCompareMode ? "Exit Matrix" : "Compare Matrix"}
                  </Button>
                  <Link
                    href={`/simulation?incidentId=${selectedIncidentId}&optionId=${plan.options[0].id}&planId=${plan.id}`}
                    className="flex-1 sm:flex-initial"
                  >
                    <Button variant="primary" size="sm" className="w-full text-xs gap-1.5 bg-blue-600">
                      Simulate Option Drill <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Mode vs Standard Inspector */}
          {isCompareMode ? (
            /* Multi-Option Comparison Grid & Matrix */
            <div className="space-y-6">
              <RecoveryComparisonTable
                plan={plan}
                incidentId={selectedIncidentId}
                selectedOptionId={selectedOption?.id}
                onSelectOption={(opt) => {
                  setSelectedOption(opt);
                }}
              />
            </div>
          ) : (
            /* Option List & Detailed Inspector */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Candidate Options List */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Candidate Recovery Options ({plan.options.length})
                </div>

                {plan.options.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border transition-all space-y-2.5 ${
                        isSelected
                          ? "bg-slate-900 border-blue-600 shadow-md text-white"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
                            #{opt.rank || "-"}
                          </span>
                          <span className="text-xs font-semibold text-white line-clamp-1">{opt.title}</span>
                        </div>
                        {getFeasibilityBadge(opt.feasibility)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          Est. Time:{" "}
                          <strong className="text-slate-200 font-mono">
                            {opt.estimatedRecoveryTime.value} {opt.estimatedRecoveryTime.unit}
                          </strong>
                        </div>
                        <div>
                          Mitigation:{" "}
                          <strong className="text-emerald-400 font-mono">
                            {opt.estimatedImpactReduction.estimatedPercent}%
                          </strong>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column (7 cols): Option Deep-Dive Inspector */}
              <div className="lg:col-span-7 space-y-6">
                {selectedOption ? (
                  <>
                    <Card className="border-slate-800 bg-slate-900/90">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                              Option Specification • Rank #{selectedOption.rank}
                            </span>
                            <CardTitle className="text-base sm:text-lg text-white mt-0.5">
                              {selectedOption.title}
                            </CardTitle>
                          </div>
                          {getFeasibilityBadge(selectedOption.feasibility)}
                        </div>
                        <CardDescription className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {selectedOption.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        {/* Rationale Quote */}
                        {selectedOption.rationale && (
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed italic">
                            &ldquo;{selectedOption.rationale}&rdquo;
                          </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Est. Duration</span>
                            <span className="font-mono font-semibold text-slate-100">
                              {selectedOption.estimatedRecoveryTime.value} {selectedOption.estimatedRecoveryTime.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Impact Mitigation</span>
                            <span className="font-mono font-semibold text-emerald-400">
                              {selectedOption.estimatedImpactReduction.estimatedPercent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Strategy Type</span>
                            <span className="font-semibold text-slate-100 uppercase">
                              {selectedOption.type}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Confidence</span>
                            <span className="font-semibold text-cyan-400 uppercase">
                              {selectedOption.confidence}
                            </span>
                          </div>
                        </div>

                        {/* Direct Simulation Drill CTA */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 mt-3">
                          <div>
                            <span className="font-semibold text-white block">Drill Verification</span>
                            <span className="text-[11px] text-slate-400">Validate this strategy against counterfactual campus loads</span>
                          </div>
                          <Link
                            href={`/simulation?incidentId=${selectedIncidentId}&optionId=${selectedOption.id}&planId=${plan.id}`}
                          >
                            <Button size="sm" variant="primary" className="gap-1.5 text-xs bg-blue-600">
                              Simulate Option Drill <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Trade-offs & Multi-Dimensional Impacts */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-blue-400" /> Operational Trade-offs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOption.tradeoffs.length === 0 ? (
                          <div className="text-xs text-slate-500 py-3 text-center">
                            No significant operational trade-off deltas recorded.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/60 text-xs">
                            {selectedOption.tradeoffs.map((t, idx) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white block">{t.dimension}</span>
                                  <p className="text-[11px] text-slate-400">{t.explanation}</p>
                                </div>
                                <Badge
                                  variant={
                                    t.direction === TradeoffDirection.BETTER
                                      ? "success"
                                      : t.direction === TradeoffDirection.WORSE
                                      ? "destructive"
                                      : "neutral"
                                  }
                                  size="sm"
                                >
                                  {String(t.value)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Prerequisites & Required Conditions */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Prerequisites & Verifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOption.prerequisites.length === 0 ? (
                          <div className="text-xs text-slate-500 py-3 text-center">
                            Zero gating prerequisites; option is immediately executable.
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs">
                            {selectedOption.prerequisites.map((p, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                              >
                                <div>
                                  <span className="font-medium text-white block">{p.description}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">Source: {p.source}</span>
                                </div>
                                <Badge variant={p.satisfied ? "success" : "warning"} size="sm">
                                  {p.satisfied ? "SATISFIED" : "PENDING VERIFICATION"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500">Select a recovery option to inspect details.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Human Review & Approval Dialog */}
      <Dialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Recovery Decision Review & Approval"
        description="Authoritative review action recorded to immutable audit ledger."
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="review-outcome" className="block text-slate-300 font-medium mb-1">Decision Outcome *</label>
            <select
              id="review-outcome"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as PlanStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value={PlanStatus.APPROVED}>Approve Recovery Recommendation</option>
              <option value={PlanStatus.UNDER_REVIEW}>Request Operational Clarification</option>
              <option value={PlanStatus.REJECTED}>Reject Plan (Request Alternative Formulations)</option>
            </select>
          </div>

          <div>
            <label htmlFor="review-notes" className="block text-slate-300 font-medium mb-1">Review Notes & Operational Instructions</label>
            <textarea
              id="review-notes"
              rows={3}
              placeholder="e.g., Authorized tie-breaker failover to Substation Grid A. Facilities dispatch instructed..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" data-dialog-initial-focus onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingReview}>
              Submit Review Decision
            </Button>
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
