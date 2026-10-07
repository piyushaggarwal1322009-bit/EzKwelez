"""Unit tests for Incident Domain, State Machine, and Invariants."""

import pytest
from app.domain.campus.models import DataMode
from app.domain.incidents.models import (
    Incident,
    IncidentSeverity,
    IncidentSource,
    IncidentStatus,
    IncidentType,
    IncidentUpdateType,
)
from app.domain.incidents.rules import (
    IncidentStateMachine,
    InvalidStatusTransitionError,
)


def test_valid_incident_creation():
    incident = Incident(
        id="inc-test-1",
        title="Fiber Cable Severed",
        description="Core optical fiber line cut near Library North quad.",
        type=IncidentType.NETWORK_OUTAGE,
        severity=IncidentSeverity.HIGH,
        status=IncidentStatus.REPORTED,
        source=IncidentSource.MANUAL,
        location_id="b-lib-01",
        root_node_id="node-wifi-core",
        data_mode=DataMode.LIVE,
    )
    assert incident.id == "inc-test-1"
    assert incident.status == IncidentStatus.REPORTED
    assert incident.severity == IncidentSeverity.HIGH
    assert incident.data_mode == DataMode.LIVE


def test_incident_empty_title_validation():
    with pytest.raises(ValueError, match="Incident title cannot be empty"):
        Incident(
            id="inc-test-2",
            title="   ",
            description="Empty title test",
            type=IncidentType.POWER_OUTAGE,
            severity=IncidentSeverity.LOW,
            status=IncidentStatus.REPORTED,
        )


def test_incident_timestamp_invariants():
    with pytest.raises(ValueError, match="resolved_at .* cannot precede started_at"):
        Incident(
            id="inc-test-3",
            title="Timestamp invariant failure",
            description="Resolved before started",
            type=IncidentType.EQUIPMENT_FAILURE,
            severity=IncidentSeverity.LOW,
            status=IncidentStatus.RESOLVED,
            started_at="2026-10-07T12:00:00Z",
            resolved_at="2026-10-07T11:00:00Z",
        )


def test_state_machine_valid_lifecycle_transitions():
    incident = Incident(
        id="inc-test-lifecycle",
        title="Substation Fault",
        description="Transformer breaker tripped.",
        type=IncidentType.POWER_OUTAGE,
        severity=IncidentSeverity.CRITICAL,
        status=IncidentStatus.REPORTED,
    )

    # REPORTED -> TRIAGED
    inc1, upd1, evts1 = IncidentStateMachine.transition(incident, IncidentStatus.TRIAGED)
    assert inc1.status == IncidentStatus.TRIAGED
    assert upd1.type == IncidentUpdateType.STATUS_CHANGED
    assert len(evts1) == 1

    # TRIAGED -> ACTIVE
    inc2, upd2, evts2 = IncidentStateMachine.transition(inc1, IncidentStatus.ACTIVE)
    assert inc2.status == IncidentStatus.ACTIVE
    # ACTIVE transition emits both StatusChanged and IncidentActivated domain events
    assert any(e.event_type == "incident.activated" for e in evts2)

    # ACTIVE -> MITIGATED
    inc3, upd3, _ = IncidentStateMachine.transition(inc2, IncidentStatus.MITIGATED)
    assert inc3.status == IncidentStatus.MITIGATED
    assert upd3.type == IncidentUpdateType.MITIGATED

    # MITIGATED -> RESOLVED
    inc4, upd4, _ = IncidentStateMachine.transition(inc3, IncidentStatus.RESOLVED)
    assert inc4.status == IncidentStatus.RESOLVED
    assert inc4.resolved_at is not None

    # RESOLVED -> CLOSED
    inc5, upd5, _ = IncidentStateMachine.transition(inc4, IncidentStatus.CLOSED)
    assert inc5.status == IncidentStatus.CLOSED
    assert inc5.closed_at is not None

    # CLOSED -> INVESTIGATING (Reopening)
    inc6, upd6, _ = IncidentStateMachine.transition(inc5, IncidentStatus.INVESTIGATING)
    assert inc6.status == IncidentStatus.INVESTIGATING


def test_state_machine_invalid_transition():
    incident = Incident(
        id="inc-test-invalid",
        title="Water leak",
        description="Basement pipe leak.",
        type=IncidentType.WATER_OUTAGE,
        severity=IncidentSeverity.MODERATE,
        status=IncidentStatus.REPORTED,
    )

    # REPORTED -> RESOLVED is directly disallowed
    with pytest.raises(InvalidStatusTransitionError) as exc_info:
        IncidentStateMachine.transition(incident, IncidentStatus.RESOLVED)

    assert exc_info.value.from_status == IncidentStatus.REPORTED
    assert exc_info.value.to_status == IncidentStatus.RESOLVED
