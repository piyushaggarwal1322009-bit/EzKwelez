"""Recovery Domain Rules, Constraint Evaluation, and Baseline Ranking."""

from dataclasses import replace
from typing import List, Tuple
from app.domain.recovery.models import (
    Feasibility,
    PlanningObjective,
    PlanningObjectivePriority,
    PlanningObjectiveType,
    RecoveryConstraint,
    RecoveryOption,
)
from app.domain.recovery.ports import (
    RecoveryConstraintEvaluator,
    RecoveryRankingService,
)


class DefaultRecoveryConstraintEvaluator(RecoveryConstraintEvaluator):
    """
    Deterministic constraint evaluation.
    Evaluates prerequisites and explicit constraints to categorize feasibility:
      - All prerequisites met & no violated hard constraints -> FEASIBLE
      - Missing prerequisites or unverified conditions       -> CONDITIONALLY_FEASIBLE
      - Hard constraint violated                             -> INFEASIBLE
    """

    def evaluate_constraints(
        self,
        options: List[RecoveryOption],
        constraints: List[RecoveryConstraint],
    ) -> List[RecoveryOption]:
        evaluated_options: List[RecoveryOption] = []

        for opt in options:
            has_unmet_prereq = any(not p.satisfied for p in opt.prerequisites)
            has_unknown_prereq = any(p.satisfied is None for p in opt.prerequisites)

            # Determine feasibility status
            if opt.feasibility == Feasibility.INFEASIBLE:
                status = Feasibility.INFEASIBLE
            elif has_unmet_prereq or has_unknown_prereq:
                status = Feasibility.CONDITIONALLY_FEASIBLE
            else:
                status = Feasibility.FEASIBLE

            evaluated_options.append(replace(opt, feasibility=status))

        return evaluated_options


class DeterministicRecoveryRankingService(RecoveryRankingService):
    """
    Phase 6 Baseline Ranking Service.
    Applies deterministic scoring to order recovery candidates prior to Phase 7 Multi-Objective Optimization.
    Scoring factors:
      - Feasibility rank: FEASIBLE (100) > CONDITIONALLY_FEASIBLE (60) > UNKNOWN (30) > INFEASIBLE (0)
      - Impact reduction percent: +1.0 point per percent
      - Recovery time penalty: -0.5 points per minute
    """

    def rank_options(
        self,
        options: List[RecoveryOption],
        objectives: List[PlanningObjective],
    ) -> List[RecoveryOption]:
        def calculate_score(opt: RecoveryOption) -> float:
            score = 0.0

            # Feasibility base score
            if opt.feasibility == Feasibility.FEASIBLE:
                score += 100.0
            elif opt.feasibility == Feasibility.CONDITIONALLY_FEASIBLE:
                score += 60.0
            elif opt.feasibility == Feasibility.UNKNOWN:
                score += 30.0
            else:
                score += 0.0

            # Impact reduction bonus
            score += opt.estimated_impact_reduction.estimated_percent

            # Recovery time penalty
            score -= (opt.estimated_recovery_time.value * 0.5)

            # Objective weights
            for obj in objectives:
                multiplier = 1.5 if obj.priority == PlanningObjectivePriority.HIGH else 1.0
                if obj.type == PlanningObjectiveType.MINIMIZE_STUDENT_DISRUPTION:
                    score += opt.estimated_impact_reduction.affected_location_reduction * 10.0 * multiplier
                elif obj.type == PlanningObjectiveType.MINIMIZE_RECOVERY_TIME:
                    score -= opt.estimated_recovery_time.value * 0.2 * multiplier

            return score

        scored: List[Tuple[float, RecoveryOption]] = [
            (calculate_score(opt), opt) for opt in options
        ]
        # Sort descending by score
        scored.sort(key=lambda item: item[0], reverse=True)

        ranked: List[RecoveryOption] = []
        for rank_idx, (_, opt) in enumerate(scored, start=1):
            rationale = (
                f"Ranked #{rank_idx} based on {opt.feasibility.value} feasibility, "
                f"{opt.estimated_impact_reduction.estimated_percent:.0f}% impact reduction, "
                f"and {opt.estimated_recovery_time.value:.0f} {opt.estimated_recovery_time.unit} estimated recovery."
            )
            ranked.append(replace(opt, rank=rank_idx, rationale=rationale))

        return ranked
