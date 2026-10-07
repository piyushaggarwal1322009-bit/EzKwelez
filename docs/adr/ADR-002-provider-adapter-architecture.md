# ADR-002: Provider / Adapter Architecture for Data Sources & Telemetry

- **Status:** Accepted
- **Deciders:** Ishu (System Architecture), Piyush (Backend), Tanisha (Frontend)
- **Date:** 2026-10-07
- **Technical Area:** Data Ingestion, Extensibility & Dependency Inversion

---

## 1. Context and Problem Statement

EzyKwelez requires continuous visibility into campus conditions—such as room occupancy and Wi-Fi/cellular connectivity—to evaluate live disruptions, assess blast radius, and formulate recovery plans.

Campus environments exhibit diverse maturity: some locations have live IoT sensors and Wi-Fi controller APIs (e.g., Cisco DNA / Aruba Central), while others rely on timetable estimates, manual staff counters, or synthetic test datasets.

We must prevent business logic from hardcoding specific vendors, mock datasets, or specific physical locations (e.g., hardcoding "Library" or "Canteen" in code), allowing dynamic onboarding of new facilities (Labs, Hostels, Auditoriums) and seamless switching between Mock and Real telemetry providers.

---

## 2. Decision Drivers

1. **Vendor Independence:** Prevent tight coupling to specific sensor hardware, campus APIs, or LLM vendors.
2. **Dynamic Location Extensibility:** Support new buildings, zones, and rooms purely through database configuration without code alterations.
3. **Deterministic Testing:** Allow complete offline unit/integration testing using mock providers with predictable outputs.
4. **Resilience & Graceful Degradation:** When a live provider is unreachable or times out, the system must degrade safely to cached snapshots or explicit fallback providers with unambiguous data provenance.

---

## 3. Considered Options

* **Option A:** Direct Ingestion in API Routes (Direct REST calls or database queries inside endpoint handlers)
* **Option B:** Static Mock Data Files inside the Web Frontend
* **Option C (Selected):** Hexagonal Port-and-Adapter Pattern with Configurable Dependency Injection

---

## 4. Decision Outcome

**Chosen Option:** Option C — Define abstract Port interfaces in the Application/Domain layer and concrete Adapter implementations in the Infrastructure layer.

### Core Provider Interfaces:

```python
class OccupancyProvider(ABC):
    @abstractmethod
    async def get_occupancy(self, location_id: str) -> OccupancySnapshot:
        """Fetch occupancy snapshot for a specific campus location."""
        pass

    @abstractmethod
    async def get_all_occupancies(self, campus_id: str) -> List[OccupancySnapshot]:
        """Fetch occupancy snapshots across an entire campus."""
        pass

class ConnectivityProvider(ABC):
    @abstractmethod
    async def get_connectivity(self, location_id: str) -> ConnectivitySnapshot:
        """Fetch Wi-Fi/cellular connectivity metrics for a location."""
        pass

    @abstractmethod
    async def get_all_connectivity(self, campus_id: str) -> List[ConnectivitySnapshot]:
        """Fetch connectivity snapshots across an entire campus."""
        pass
```

### Provider Implementation Strategy:
1. **Mock Providers:** `MockOccupancyProvider` and `MockConnectivityProvider` generate deterministic, realistic synthetic telemetry tagged with `DataMode.SIMULATED` or `DataMode.ESTIMATED`.
2. **Real Providers:** `RealOccupancyProvider` and `RealConnectivityProvider` interface with live sensors or network controller APIs, tagged with `DataMode.LIVE`.
3. **Factory & Injection:** Dependency injection in FastAPI (`app/api/dependencies.py`) resolves concrete implementations based on `OCCUPANCY_PROVIDER_TYPE` and `CONNECTIVITY_PROVIDER_TYPE` environment variables.

```text
Application Service (e.g. ConditionAggregationService)
       ↓ (depends on abstract interface)
OccupancyProvider / ConnectivityProvider
       ├── MockOccupancyProvider (Simulated / Seeded)
       └── RealOccupancyProvider (IoT / Sensor Gateway)
```

---

## 5. Consequences

### Positive:
* **Zero Location Hardcoding:** Any campus location (Library, Canteen, Computer Lab, Hostel, Auditorium) stored in `campus_locations` is processed identically via its `id`.
* **Zero UI Disruption on Provider Switch:** Frontend consumes standard `LocationCondition` contracts regardless of whether underlying data is synthetic or hardware-driven.
* **Test Isolation:** Integration tests inject mock providers without external network access or rate limit concerns.

### Negative / Tradeoffs:
* Requires maintaining adapter boilerplate and ensuring mock providers stay synchronized with real telemetry schema evolutions.
* Async timeout handling and circuit breaking must be implemented in each real adapter.

---

## 6. Compliance and Verification

* Unit tests verify that domain services operate against abstract provider interfaces using mock instances.
* Configuration tests ensure swapping provider environment variables dynamically changes runtime adapter binding.
