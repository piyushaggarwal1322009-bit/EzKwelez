from typing import List, Optional
import uuid

from app.domain.assessment.models import IncidentAssessment, AffectedEntity, BlastRadiusResult
from app.domain.graph.models import DependencyGraph, NodeStatus, NodeType
from app.domain.recovery.models import (
    RecoveryOption,
    RecoveryAction,
    RecoveryOptionType,
    RecoveryActionType,
    Feasibility,
    EstimatedRecoveryTime,
    ImpactReduction,
)


class RecoveryCandidateGenerator:
    """Deterministically generates candidate recovery plans from domain entities.
    
    Same input → same output. No AI. No randomness.
    Only generates actions supported by actual modeled graph data.
    """

    def generate_candidates(
        self, assessment: IncidentAssessment, graph: DependencyGraph
    ) -> List[RecoveryOption]:
        options: List[RecoveryOption] = []
        direct_entities = assessment.blast_radius.direct_entities

        if not direct_entities:
            return []

        for direct in direct_entities:
            # Option 1: Always generate a restore-primary option
            options.append(self._generate_restore_option(direct))

            # Option 2: Check if a backup/alternative node exists in graph
            backup_option = self._generate_backup_option(direct, graph)
            if backup_option:
                options.append(backup_option)

            # Option 3: Isolation of immediate downstream if transitive impact exists
            if assessment.blast_radius.transitive_entities:
                iso = self._generate_isolation_option(
                    direct, assessment.blast_radius.transitive_entities
                )
                if iso:
                    options.append(iso)

        return options

    def _generate_restore_option(self, direct: AffectedEntity) -> RecoveryOption:
        action = RecoveryAction(
            action_id=f"act-{uuid.uuid4().hex[:8]}",
            action_type=RecoveryActionType.RESTORE,
            target_entity=direct.entity_id,
            description=f"Restore {direct.entity_name} to operational state.",
            estimated_duration=EstimatedRecoveryTime(value=60.0),
        )
        return RecoveryOption(
            id=f"opt-{uuid.uuid4().hex[:8]}",
            title=f"Restore {direct.entity_name}",
            description=f"Standard restoration procedure for {direct.entity_name}.",
            type=RecoveryOptionType.RESTORE,
            feasibility=Feasibility.UNKNOWN,  # Validator will update
            estimated_recovery_time=EstimatedRecoveryTime(value=60.0),
            estimated_impact_reduction=ImpactReduction(affected_node_reduction=1, affected_location_reduction=0, severity_reduction="high", estimated_percent=80.0),
            actions=[action],
            rationale=f"Incident root entity is {direct.entity_name} (depth={direct.depth}).",
        )

    def _generate_backup_option(
        self, direct: AffectedEntity, graph: DependencyGraph
    ) -> Optional[RecoveryOption]:
        """Generate a failover option only if a backup node is explicitly modeled."""
        backup_node = None
        target_type_lower = direct.entity_type.lower()

        for node in graph.nodes.values():
            if node.id == direct.entity_id:
                continue
            name_lower = node.name.lower()
            # Match backup generator for utility nodes
            if target_type_lower == "utility" and (
                "backup" in name_lower or "generator" in name_lower or "emergency" in name_lower
            ):
                backup_node = node
                break
            # Match backup node of same type
            if (
                "backup" in name_lower
                and hasattr(NodeType, target_type_lower.upper())
                and node.type == getattr(NodeType, target_type_lower.upper())
            ):
                backup_node = node
                break

        if not backup_node:
            return None

        action = RecoveryAction(
            action_id=f"act-{uuid.uuid4().hex[:8]}",
            action_type=RecoveryActionType.ACTIVATE_BACKUP,
            target_entity=backup_node.id,
            source_entity=direct.entity_id,
            description=(
                f"Activate {backup_node.name} as substitute for {direct.entity_name}."
            ),
            estimated_duration=EstimatedRecoveryTime(value=15.0),
        )
        return RecoveryOption(
            id=f"opt-{uuid.uuid4().hex[:8]}",
            title=f"Activate Backup: {backup_node.name}",
            description=f"Failover to {backup_node.name}.",
            type=RecoveryOptionType.FAILOVER,
            feasibility=Feasibility.UNKNOWN,
            estimated_recovery_time=EstimatedRecoveryTime(value=15.0),
            estimated_impact_reduction=ImpactReduction(affected_node_reduction=1, affected_location_reduction=0, severity_reduction="high", estimated_percent=90.0),
            actions=[action],
            rationale=(
                f"Modeled backup node '{backup_node.name}' can substitute for {direct.entity_name}."
            ),
        )

    def _generate_isolation_option(
        self, direct: AffectedEntity, transitive: List[AffectedEntity]
    ) -> Optional[RecoveryOption]:
        """Isolate immediate (depth=1) downstream dependents to contain cascading failure."""
        immediate = [e for e in transitive if e.depth == 1]
        if not immediate:
            return None

        actions = [
            RecoveryAction(
                action_id=f"act-{uuid.uuid4().hex[:8]}",
                action_type=RecoveryActionType.ISOLATE,
                target_entity=dep.entity_id,
                description=f"Isolate {dep.entity_name} to prevent cascade failure.",
            )
            for dep in immediate
        ]
        return RecoveryOption(
            id=f"opt-{uuid.uuid4().hex[:8]}",
            title="Temporary Service Isolation",
            description="Isolate immediate downstream dependents while primary entity is offline.",
            type=RecoveryOptionType.ISOLATE,
            feasibility=Feasibility.UNKNOWN,
            estimated_recovery_time=EstimatedRecoveryTime(value=5.0),
            estimated_impact_reduction=ImpactReduction(affected_node_reduction=0, affected_location_reduction=0, severity_reduction="medium", estimated_percent=50.0),
            actions=actions,
            rationale=f"Protects {len(immediate)} immediate downstream entities from cascading failure.",
        )
