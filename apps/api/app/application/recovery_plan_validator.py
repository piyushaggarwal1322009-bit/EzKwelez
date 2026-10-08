from typing import List
from dataclasses import replace

from app.domain.graph.models import DependencyGraph, NodeStatus
from app.domain.recovery.models import (
    RecoveryOption,
    RecoveryActionType,
    Feasibility,
    ConstraintViolation,
    ConstraintViolationType,
)


class RecoveryPlanValidator:
    """Validates candidate recovery options against live campus graph state.
    
    Follows SOLID – single responsibility: validation only.
    Does NOT generate candidates or compute impact.
    Returns new RecoveryOption instances with feasibility and violations set.
    """

    def validate(
        self, options: List[RecoveryOption], graph: DependencyGraph
    ) -> List[RecoveryOption]:
        return [self._validate_option(opt, graph) for opt in options]

    def _validate_option(
        self, option: RecoveryOption, graph: DependencyGraph
    ) -> RecoveryOption:
        violations: List[ConstraintViolation] = []

        for action in option.actions:
            self._validate_action(action, graph, violations)

        feasibility = self._determine_feasibility(violations)
        return replace(option, feasibility=feasibility, violations=violations)

    def _validate_action(self, action, graph, violations: List[ConstraintViolation]) -> None:
        target_node = graph.nodes.get(action.target_entity)

        # Target must exist in graph
        if not target_node:
            violations.append(ConstraintViolation(
                type=ConstraintViolationType.TARGET_UNAVAILABLE,
                message=f"Target entity '{action.target_entity}' not found in campus graph.",
                action_id=action.action_id,
            ))
            return

        action_type_val = (
            action.action_type.value
            if hasattr(action.action_type, "value")
            else str(action.action_type)
        )

        if action_type_val == RecoveryActionType.ACTIVATE_BACKUP.value:
            # Backup must be operational
            if target_node.status == NodeStatus.OFFLINE:
                violations.append(ConstraintViolation(
                    type=ConstraintViolationType.RESOURCE_UNAVAILABLE,
                    message=f"Backup resource '{target_node.name}' is OFFLINE.",
                    action_id=action.action_id,
                ))
            elif target_node.status == NodeStatus.MAINTENANCE:
                violations.append(ConstraintViolation(
                    type=ConstraintViolationType.RESOURCE_UNAVAILABLE,
                    message=f"Backup resource '{target_node.name}' is under MAINTENANCE.",
                    action_id=action.action_id,
                ))
            elif target_node.status == NodeStatus.DEGRADED:
                # Not hard infeasible — insufficient info
                violations.append(ConstraintViolation(
                    type=ConstraintViolationType.MISSING_INFORMATION,
                    message=f"Backup resource '{target_node.name}' is DEGRADED. Manual verification required.",
                    action_id=action.action_id,
                ))

        if action_type_val == RecoveryActionType.RESTORE.value:
            # Restoring an already-operational entity is a conflict
            if target_node.status == NodeStatus.OPERATIONAL:
                violations.append(ConstraintViolation(
                    type=ConstraintViolationType.CONFLICTING_ACTION,
                    message=f"'{target_node.name}' is already OPERATIONAL — restore not needed.",
                    action_id=action.action_id,
                ))

        # Duration unknown is MISSING_INFORMATION (soft — doesn't block feasibility alone)
        if not action.estimated_duration:
            violations.append(ConstraintViolation(
                type=ConstraintViolationType.MISSING_INFORMATION,
                message=f"Estimated duration for action '{action.action_id}' is unknown.",
                action_id=action.action_id,
            ))

    def _determine_feasibility(
        self, violations: List[ConstraintViolation]
    ) -> Feasibility:
        hard_blocking = {
            ConstraintViolationType.RESOURCE_UNAVAILABLE,
            ConstraintViolationType.TARGET_UNAVAILABLE,
            ConstraintViolationType.CONFLICTING_ACTION,
            ConstraintViolationType.PREREQUISITE_NOT_MET,
            ConstraintViolationType.CAPACITY_INSUFFICIENT,
        }
        if any(v.type in hard_blocking for v in violations):
            return Feasibility.INFEASIBLE
        if any(v.type == ConstraintViolationType.MISSING_INFORMATION for v in violations):
            return Feasibility.UNKNOWN
        return Feasibility.FEASIBLE
