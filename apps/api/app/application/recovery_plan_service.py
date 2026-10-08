"""Recovery Plan Application Service.

Orchestrates: Incident → Phase 5 Assessment → Candidate Generation → Constraint Validation → RecoveryPlan
Phase 6 only — NO optimization, NO ranking (Phase 7).
"""
import uuid
from app.domain.incidents.models import Incident
from app.domain.recovery.models import RecoveryPlan
from app.application.assessment_service import AssessmentService
from app.application.recovery_candidate_generator import RecoveryCandidateGenerator
from app.application.recovery_plan_validator import RecoveryPlanValidator
from app.domain.graph.ports import DependencyGraphRepository


class RecoveryPlanService:
    """Generates deterministic, non-persistent recovery plans for an incident."""

    def __init__(
        self,
        assessment_service: AssessmentService,
        graph_repository: DependencyGraphRepository,
        candidate_generator: RecoveryCandidateGenerator,
        plan_validator: RecoveryPlanValidator,
    ):
        self._assessment_service = assessment_service
        self._graph_repository = graph_repository
        self._candidate_generator = candidate_generator
        self._plan_validator = plan_validator

    async def generate_recovery_plans(self, incident: Incident) -> RecoveryPlan:
        """Full pipeline: Incident → Assessment → Candidates → Validation → RecoveryPlan."""
        # 1. Reuse Phase 5 assessment (blast radius + impact)
        assessment = await self._assessment_service.generate_assessment(
            incident_id=incident.id,
            campus_id=incident.campus_id,
        )

        # 2. Load authoritative graph for constraint validation
        graph = await self._graph_repository.get_graph()

        # 3. Deterministic candidate generation
        candidates = self._candidate_generator.generate_candidates(assessment, graph)

        # 4. Constraint validation → sets feasibility + violations on each option
        validated = self._plan_validator.validate(candidates, graph)

        return RecoveryPlan(
            id=f"plan-{uuid.uuid4().hex[:8]}",
            incident_id=incident.id,
            impact_analysis_id=assessment.assessment_id,
            options=validated,
            data_mode=incident.data_mode,
        )
