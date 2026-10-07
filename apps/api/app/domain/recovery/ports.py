"""Recovery Domain Ports & Interfaces."""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.campus.ports import CampusContextProvider
from app.domain.impact.models import ImpactReport
from app.domain.recovery.models import (
    PlanningObjective,
    RecoveryConstraint,
    RecoveryOption,
    RecoveryPlan,
    RecoveryPlanGeneratedEvent,
    RecoveryPlanReviewedEvent,
    ResourceRequirement,
)


class RecoveryCandidateGenerator(ABC):
    """Port for generating candidate recovery options from an impact report."""

    @abstractmethod
    async def generate_candidates(
        self,
        impact_report: ImpactReport,
        campus_context: CampusContextProvider,
        available_resources: Optional[List[ResourceRequirement]] = None,
    ) -> List[RecoveryOption]:
        """Produce raw recovery candidate strategies."""
        pass


class RecoveryConstraintEvaluator(ABC):
    """Port for evaluating operational feasibility against campus constraints."""

    @abstractmethod
    def evaluate_constraints(
        self,
        options: List[RecoveryOption],
        constraints: List[RecoveryConstraint],
    ) -> List[RecoveryOption]:
        """Check options against hard/soft constraints and assign updated feasibility status."""
        pass


class RecoveryRankingService(ABC):
    """Port for initial deterministic baseline ranking of recovery options."""

    @abstractmethod
    def rank_options(
        self,
        options: List[RecoveryOption],
        objectives: List[PlanningObjective],
    ) -> List[RecoveryOption]:
        """Assign ordinal rank and rationale to recovery candidates."""
        pass


class RecoveryPlanRepository(ABC):
    """Port for RecoveryPlan persistence."""

    @abstractmethod
    async def save(self, plan: RecoveryPlan) -> RecoveryPlan:
        """Persist a new recovery plan."""
        pass

    @abstractmethod
    async def get_by_id(self, plan_id: str) -> Optional[RecoveryPlan]:
        """Retrieve a plan by ID."""
        pass

    @abstractmethod
    async def list_by_incident(self, incident_id: str) -> List[RecoveryPlan]:
        """List all plan versions for an incident."""
        pass

    @abstractmethod
    async def get_latest_for_incident(self, incident_id: str) -> Optional[RecoveryPlan]:
        """Retrieve the most recent plan version for an incident."""
        pass

    @abstractmethod
    async def update(self, plan: RecoveryPlan) -> RecoveryPlan:
        """Update an existing plan (e.g. human review status)."""
        pass


class RecoveryEventPublisher(ABC):
    """Port for publishing recovery domain events."""

    @abstractmethod
    async def publish_generated(self, event: RecoveryPlanGeneratedEvent) -> None:
        """Publish recovery plan generation event."""
        pass

    @abstractmethod
    async def publish_reviewed(self, event: RecoveryPlanReviewedEvent) -> None:
        """Publish human review outcome event."""
        pass
