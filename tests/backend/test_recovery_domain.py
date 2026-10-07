"""Unit tests for Phase 9 Recovery Planning Domain Models, Constraints, and Ranking."""

import pytest
from app.domain.campus.models import DataMode
from app.domain.graph.models import Criticality
from app.domain.recovery.models import (
    ConstraintSeverity,
    ConstraintType,
    EstimatedRecoveryTime,
    Feasibility,
    ImpactReduction,
    PlanStatus,
    PlanningObjective,
    PlanningObjectivePriority,
    PlanningObjectiveType,
    RecoveryConstraint,
    RecoveryOption,
    RecoveryOptionType,
    RecoveryPlan,
    RecoveryPrerequisite,
    ResourceRequirement,
    ResourceType,
)
from app.domain.recovery.rules import (
    DefaultRecoveryConstraintEvaluator,
    DeterministicRecoveryRankingService,
)


def test_recovery_plan_initialization_and_invariants():
    """Verify recovery plan structure, versioning, and default properties."""
    plan = RecoveryPlan(
        id="plan_test_01",
        incident_id="inc_test_01",
        impact_analysis_id="ana_test_01",
        version=1,
        status=PlanStatus.DRAFT,
        data_mode=DataMode.LIVE,
    )
    assert plan.id == "plan_test_01"
    assert plan.incident_id == "inc_test_01"
    assert plan.version == 1
    assert plan.status == PlanStatus.DRAFT
    assert plan.data_mode == DataMode.LIVE

    with pytest.raises(ValueError):
        RecoveryPlan(id="", incident_id="inc_test_01")

    with pytest.raises(ValueError):
        RecoveryPlan(id="plan_01", incident_id="", version=0)


def test_recovery_option_validation():
    """Verify recovery option and value object creation."""
    option = RecoveryOption(
        id="opt_01",
        title="Failover to Backup Generator B",
        description="Switch electrical load to diesel generator B.",
        type=RecoveryOptionType.FAILOVER,
        feasibility=Feasibility.FEASIBLE,
        estimated_recovery_time=EstimatedRecoveryTime(value=15.0, unit="minutes"),
        estimated_impact_reduction=ImpactReduction(
            affected_node_reduction=5,
            affected_location_reduction=2,
            severity_reduction="CRITICAL -> LOW",
            estimated_percent=90.0,
        ),
        prerequisites=[
            RecoveryPrerequisite(
                type="FUEL_CHECK",
                description="Generator fuel >= 50%",
                satisfied=True,
            )
        ],
        resource_requirements=[
            ResourceRequirement(
                resource_type=ResourceType.BACKUP_POWER,
                quantity=100.0,
                availability="confirmed",
            )
        ],
    )
    assert option.id == "opt_01"
    assert option.feasibility == Feasibility.FEASIBLE
    assert option.estimated_recovery_time.value == 15.0
    assert option.estimated_impact_reduction.estimated_percent == 90.0

    with pytest.raises(ValueError):
        RecoveryOption(
            id="",
            title="Invalid",
            description="desc",
            type=RecoveryOptionType.RESTORE,
            feasibility=Feasibility.FEASIBLE,
            estimated_recovery_time=EstimatedRecoveryTime(value=10.0),
            estimated_impact_reduction=ImpactReduction(
                affected_node_reduction=1,
                affected_location_reduction=1,
                severity_reduction="LOW",
                estimated_percent=10.0,
            ),
        )


def test_constraint_evaluator_feasibility():
    """Verify deterministic feasibility evaluation."""
    evaluator = DefaultRecoveryConstraintEvaluator()

    opt_feasible = RecoveryOption(
        id="opt_feasible",
        title="Feasible Option",
        description="All prerequisites met",
        type=RecoveryOptionType.RESTORE,
        feasibility=Feasibility.FEASIBLE,
        estimated_recovery_time=EstimatedRecoveryTime(value=10.0),
        estimated_impact_reduction=ImpactReduction(
            affected_node_reduction=2,
            affected_location_reduction=1,
            severity_reduction="MODERATE",
            estimated_percent=50.0,
        ),
        prerequisites=[
            RecoveryPrerequisite(type="ACCESS", description="Keys available", satisfied=True)
        ],
    )

    opt_conditional = RecoveryOption(
        id="opt_conditional",
        title="Conditional Option",
        description="Prerequisite unknown or not satisfied",
        type=RecoveryOptionType.RELOCATE,
        feasibility=Feasibility.FEASIBLE,
        estimated_recovery_time=EstimatedRecoveryTime(value=20.0),
        estimated_impact_reduction=ImpactReduction(
            affected_node_reduction=1,
            affected_location_reduction=1,
            severity_reduction="LOW",
            estimated_percent=30.0,
        ),
        prerequisites=[
            RecoveryPrerequisite(type="VACANCY", description="Room vacant", satisfied=False)
        ],
    )

    evaluated = evaluator.evaluate_constraints(
        options=[opt_feasible, opt_conditional],
        constraints=[],
    )

    assert evaluated[0].feasibility == Feasibility.FEASIBLE
    assert evaluated[1].feasibility == Feasibility.CONDITIONALLY_FEASIBLE


def test_deterministic_ranking_service():
    """Verify deterministic scoring and ranking of recovery options."""
    ranker = DeterministicRecoveryRankingService()

    opt_a = RecoveryOption(
        id="opt_a",
        title="Fast High Impact Recovery",
        description="Recovers 90% in 10 mins",
        type=RecoveryOptionType.FAILOVER,
        feasibility=Feasibility.FEASIBLE,
        estimated_recovery_time=EstimatedRecoveryTime(value=10.0),
        estimated_impact_reduction=ImpactReduction(
            affected_node_reduction=10,
            affected_location_reduction=3,
            severity_reduction="HIGH",
            estimated_percent=90.0,
        ),
    )

    opt_b = RecoveryOption(
        id="opt_b",
        title="Slow Low Impact Recovery",
        description="Recovers 30% in 60 mins",
        type=RecoveryOptionType.MANUAL_INTERVENTION,
        feasibility=Feasibility.CONDITIONALLY_FEASIBLE,
        estimated_recovery_time=EstimatedRecoveryTime(value=60.0),
        estimated_impact_reduction=ImpactReduction(
            affected_node_reduction=2,
            affected_location_reduction=1,
            severity_reduction="LOW",
            estimated_percent=30.0,
        ),
    )

    objectives = [
        PlanningObjective(
            type=PlanningObjectiveType.MINIMIZE_STUDENT_DISRUPTION,
            priority=PlanningObjectivePriority.HIGH,
        ),
        PlanningObjective(
            type=PlanningObjectiveType.MINIMIZE_RECOVERY_TIME,
            priority=PlanningObjectivePriority.HIGH,
        ),
    ]

    ranked = ranker.rank_options(options=[opt_b, opt_a], objectives=objectives)

    assert len(ranked) == 2
    assert ranked[0].id == "opt_a"
    assert ranked[0].rank == 1
    assert "Ranked #1" in ranked[0].rationale
    assert ranked[1].id == "opt_b"
    assert ranked[1].rank == 2
