"""Unit tests for Campus Domain entities, value objects, and business rules."""

import sys
from pathlib import Path
import pytest

# Add apps/api to Python path
api_path = Path(__file__).resolve().parent.parent.parent / "apps" / "api"
if str(api_path) not in sys.path:
    sys.path.insert(0, str(api_path))

from app.domain.campus.models import (
    CampusLocation,
    ConnectivityQuality,
    ConnectivitySnapshot,
    DataMode,
    EntityType,
    OccupancySnapshot,
    OccupancyStatus,
    classify_connectivity,
    classify_occupancy,
)


def test_classify_occupancy_thresholds():
    """Verify canonical occupancy thresholds."""
    assert classify_occupancy(0.0) == OccupancyStatus.LOW
    assert classify_occupancy(49.0) == OccupancyStatus.LOW
    assert classify_occupancy(50.0) == OccupancyStatus.MODERATE
    assert classify_occupancy(74.0) == OccupancyStatus.MODERATE
    assert classify_occupancy(75.0) == OccupancyStatus.BUSY
    assert classify_occupancy(89.0) == OccupancyStatus.BUSY
    assert classify_occupancy(90.0) == OccupancyStatus.VERY_BUSY
    assert classify_occupancy(100.0) == OccupancyStatus.VERY_BUSY
    assert classify_occupancy(101.0) == OccupancyStatus.OVER_CAPACITY


def test_classify_connectivity_thresholds():
    """Verify canonical connectivity thresholds."""
    assert classify_connectivity(0) == ConnectivityQuality.VERY_WEAK
    assert classify_connectivity(19) == ConnectivityQuality.VERY_WEAK
    assert classify_connectivity(20) == ConnectivityQuality.WEAK
    assert classify_connectivity(39) == ConnectivityQuality.WEAK
    assert classify_connectivity(40) == ConnectivityQuality.FAIR
    assert classify_connectivity(59) == ConnectivityQuality.FAIR
    assert classify_connectivity(60) == ConnectivityQuality.GOOD
    assert classify_connectivity(79) == ConnectivityQuality.GOOD
    assert classify_connectivity(80) == ConnectivityQuality.EXCELLENT
    assert classify_connectivity(100) == ConnectivityQuality.EXCELLENT


def test_occupancy_snapshot_creation():
    """Verify OccupancySnapshot factory calculates percentage and assigns status."""
    snapshot = OccupancySnapshot.create(
        location_id="loc_01",
        current_students=34,
        capacity=40,
        data_mode=DataMode.SIMULATED,
    )
    assert snapshot.location_id == "loc_01"
    assert snapshot.occupancy_percentage == 85.0
    assert snapshot.status == OccupancyStatus.BUSY
    assert snapshot.data_mode == DataMode.SIMULATED


def test_connectivity_snapshot_creation():
    """Verify ConnectivitySnapshot factory validates score and maps quality."""
    snapshot = ConnectivitySnapshot.create(
        location_id="loc_01",
        signal_score=95,
        network_name="APEX-5G",
        data_mode=DataMode.SIMULATED,
    )
    assert snapshot.signal_score == 95
    assert snapshot.quality == ConnectivityQuality.EXCELLENT
    assert snapshot.network_name == "APEX-5G"


def test_location_invariants():
    """Verify that invalid capacities raise ValueError."""
    with pytest.raises(ValueError):
        CampusLocation(
            id="loc_invalid",
            name="Invalid Room",
            type=EntityType.ROOM,
            campus_id="cmp_01",
            building_id="bld_01",
            capacity=0,
        )
