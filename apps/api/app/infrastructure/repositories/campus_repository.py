"""Repository for Campus, Locations, Resources, Services, and Dependencies."""

import uuid
from typing import Dict, List, Optional
from app.domain.campus.exceptions import (
    CampusNotFoundError,
    DuplicateDependencyError,
    EntityNotFoundError,
    InvalidDependencyError,
    SelfDependencyError,
)
from app.domain.campus.models import (
    Campus,
    CampusEntityType,
    CampusGraph,
    Dependency,
    DependencyStrength,
    DependencyType,
    Location,
    LocationType,
    Resource,
    ResourceType,
    CampusService,
    ServiceType,
    StructuralStatus,
)
from app.domain.graph.traversal import build_campus_graph


class CampusRepository:
    """In-memory and persistent adapter for campus infrastructure data."""

    def __init__(self):
        self._campuses: Dict[str, Campus] = {}
        self._locations: Dict[str, Location] = {}
        self._resources: Dict[str, Resource] = {}
        self._services: Dict[str, CampusService] = {}
        self._dependencies: Dict[str, Dependency] = {}
        self._initialize_seed_data()

    def _initialize_seed_data(self):
        """Pre-populate canonical synthetic university dataset."""
        campus_id = "a0000000-0000-0000-0000-000000000001"
        self._campuses[campus_id] = Campus(
            id=campus_id,
            name="Ezy University",
            code="EZY-MAIN",
            description="Main collegiate campus for disruption response and dependency simulation",
        )

        locations_data = [
            ("b0000000-0000-0000-0000-000000000001", "Main Library", "LOC-LIB", LocationType.LIBRARY, "Central multi-floor university library", 450),
            ("b0000000-0000-0000-0000-000000000002", "Central Canteen", "LOC-CAN", LocationType.CANTEEN, "Primary campus dining hall and food court", 300),
            ("b0000000-0000-0000-0000-000000000003", "Academic Block A", "LOC-ACAD-A", LocationType.ACADEMIC, "Undergraduate lecture halls and auditoriums", 600),
            ("b0000000-0000-0000-0000-000000000004", "Academic Block B", "LOC-ACAD-B", LocationType.ACADEMIC, "Graduate seminar rooms and faculty offices", 400),
            ("b0000000-0000-0000-0000-000000000005", "Computer Lab", "LOC-LAB-CS", LocationType.LABORATORY, "High-performance computing workstations", 120),
            ("b0000000-0000-0000-0000-000000000006", "Administration Block", "LOC-ADMIN", LocationType.ADMINISTRATION, "Registrar, admissions, and campus operations center", 150),
            ("b0000000-0000-0000-0000-000000000007", "Hostel Block A", "LOC-HOST-A", LocationType.HOSTEL, "Residential student dormitories", 350),
            ("b0000000-0000-0000-0000-000000000008", "Student Activity Centre", "LOC-SAC", LocationType.COMMON_AREA, "Student union, recreation, and clubs", 250),
            ("b0000000-0000-0000-0000-000000000009", "Main Gate", "LOC-GATE-1", LocationType.ENTRANCE, "Campus perimeter security checkpoint and vehicle gate", 50),
        ]
        for loc_id, name, code, loc_type, desc, cap in locations_data:
            self._locations[loc_id] = Location(
                id=loc_id,
                campus_id=campus_id,
                name=name,
                code=code,
                location_type=loc_type,
                description=desc,
                capacity=cap,
                status=StructuralStatus.ACTIVE,
            )

        resources_data = [
            ("c0000000-0000-0000-0000-000000000001", "b0000000-0000-0000-0000-000000000006", "Main Transformer", "RES-TX-01", ResourceType.POWER, "Primary grid stepping substation for campus"),
            ("c0000000-0000-0000-0000-000000000002", "b0000000-0000-0000-0000-000000000003", "Electrical Panel A", "RES-PNL-A", ResourceType.POWER, "Sub-distribution electrical panel for North Sector"),
            ("c0000000-0000-0000-0000-000000000003", "b0000000-0000-0000-0000-000000000006", "Network Core Switch", "RES-NET-CORE", ResourceType.NETWORK, "Campus fiber backbone routing core"),
            ("c0000000-0000-0000-0000-000000000004", "b0000000-0000-0000-0000-000000000001", "Library Network Switch", "RES-NET-LIB", ResourceType.NETWORK, "Managed gigabit access switch in Library"),
            ("c0000000-0000-0000-0000-000000000005", "b0000000-0000-0000-0000-000000000002", "Canteen Network Switch", "RES-NET-CAN", ResourceType.NETWORK, "POS terminal network switch in Canteen"),
            ("c0000000-0000-0000-0000-000000000006", "b0000000-0000-0000-0000-000000000007", "Water Pump A", "RES-PUMP-01", ResourceType.WATER, "Hydraulic booster pump for residential hostels"),
            ("c0000000-0000-0000-0000-000000000007", "b0000000-0000-0000-0000-000000000006", "Campus Generator", "RES-GEN-01", ResourceType.POWER, "Emergency diesel backup generation system"),
            ("c0000000-0000-0000-0000-000000000008", "b0000000-0000-0000-0000-000000000001", "Library Wi-Fi AP", "RES-WIFI-LIB", ResourceType.NETWORK, "High-density wireless access point in study hall"),
        ]
        for res_id, loc_id, name, code, res_type, desc in resources_data:
            self._resources[res_id] = Resource(
                id=res_id,
                campus_id=campus_id,
                location_id=loc_id,
                name=name,
                code=code,
                resource_type=res_type,
                description=desc,
                status=StructuralStatus.ACTIVE,
            )

        services_data = [
            ("d0000000-0000-0000-0000-000000000001", None, "Campus Internet", "SVC-INET", ServiceType.NETWORK, "University wide-area broadband connection"),
            ("d0000000-0000-0000-0000-000000000002", "b0000000-0000-0000-0000-000000000001", "Library Wi-Fi", "SVC-WIFI-LIB", ServiceType.NETWORK, "Student wireless connectivity in Library"),
            ("d0000000-0000-0000-0000-000000000003", "b0000000-0000-0000-0000-000000000002", "Canteen POS", "SVC-POS-CAN", ServiceType.FOOD, "Electronic meal payments and checkout service"),
            ("d0000000-0000-0000-0000-000000000004", "b0000000-0000-0000-0000-000000000001", "Library Access System", "SVC-ACC-LIB", ServiceType.ACCESS, "RFID turnstile entry control for Library"),
            ("d0000000-0000-0000-0000-000000000005", "b0000000-0000-0000-0000-000000000009", "Campus CCTV", "SVC-SEC-CCTV", ServiceType.SECURITY, "Security video monitoring network"),
            ("d0000000-0000-0000-0000-000000000006", "b0000000-0000-0000-0000-000000000007", "Hostel Water Supply", "SVC-WTR-HOST", ServiceType.WATER, "Potable running water distribution in Hostel Block A"),
            ("d0000000-0000-0000-0000-000000000007", "b0000000-0000-0000-0000-000000000006", "Student Information System", "SVC-SIS", ServiceType.ACADEMIC, "Academic portal, grading, and course enrollment"),
        ]
        for svc_id, loc_id, name, code, svc_type, desc in services_data:
            self._services[svc_id] = CampusService(
                id=svc_id,
                campus_id=campus_id,
                location_id=loc_id,
                name=name,
                code=code,
                service_type=svc_type,
                description=desc,
                status=StructuralStatus.ACTIVE,
            )

        deps_data = [
            ("e0000000-0000-0000-0000-000000000001", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000001", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000002", DependencyType.POWER, DependencyStrength.REQUIRED, "Main Transformer feeds Electrical Panel A"),
            ("e0000000-0000-0000-0000-000000000002", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000002", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000001", DependencyType.POWER, DependencyStrength.CRITICAL, "Electrical Panel A provides grid power to Main Library"),
            ("e0000000-0000-0000-0000-000000000003", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000002", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000002", DependencyType.POWER, DependencyStrength.CRITICAL, "Electrical Panel A provides grid power to Central Canteen"),
            ("e0000000-0000-0000-0000-000000000004", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000002", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000004", DependencyType.POWER, DependencyStrength.REQUIRED, "Electrical Panel A powers RFID Library Access System"),
            ("e0000000-0000-0000-0000-000000000005", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000001", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000003", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Campus Internet feeds Network Core Switch"),
            ("e0000000-0000-0000-0000-000000000006", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000003", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000004", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Network Core Switch connects Library Network Switch"),
            ("e0000000-0000-0000-0000-000000000007", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000003", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000005", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Network Core Switch connects Canteen Network Switch"),
            ("e0000000-0000-0000-0000-000000000008", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000003", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000007", DependencyType.NETWORK, DependencyStrength.CRITICAL, "Network Core Switch serves Student Information System"),
            ("e0000000-0000-0000-0000-000000000009", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000004", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000008", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Library Network Switch uplinks Library Wi-Fi AP"),
            ("e0000000-0000-0000-0000-000000000010", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000008", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000002", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Library Wi-Fi AP broadcasts Library Wi-Fi service"),
            ("e0000000-0000-0000-0000-000000000011", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000001", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000002", DependencyType.OPERATIONAL, DependencyStrength.IMPORTANT, "Library physical space hosts Library Wi-Fi access"),
            ("e0000000-0000-0000-0000-000000000012", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000005", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000003", DependencyType.NETWORK, DependencyStrength.REQUIRED, "Canteen Network Switch links Canteen POS system"),
            ("e0000000-0000-0000-0000-000000000013", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000002", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000003", DependencyType.OPERATIONAL, DependencyStrength.CRITICAL, "Central Canteen physical operation requires POS payment system"),
            ("e0000000-0000-0000-0000-000000000014", CampusEntityType.RESOURCE, "c0000000-0000-0000-0000-000000000006", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000007", DependencyType.WATER, DependencyStrength.REQUIRED, "Water Pump A pumps water to Hostel Block A"),
            ("e0000000-0000-0000-0000-000000000015", CampusEntityType.LOCATION, "b0000000-0000-0000-0000-000000000007", CampusEntityType.SERVICE, "d0000000-0000-0000-0000-000000000006", DependencyType.WATER, DependencyStrength.REQUIRED, "Hostel Block A delivers Hostel Water Supply"),
        ]
        for dep_id, s_type, s_id, t_type, t_id, d_type, strength, desc in deps_data:
            self._dependencies[dep_id] = Dependency(
                id=dep_id,
                campus_id=campus_id,
                source_type=s_type,
                source_id=s_id,
                target_type=t_type,
                target_id=t_id,
                dependency_type=d_type,
                strength=strength,
                description=desc,
            )

    # --- Campus Operations ---
    def list_campuses(self) -> List[Campus]:
        return list(self._campuses.values())

    def get_campus(self, campus_id: str) -> Campus:
        if campus_id not in self._campuses:
            raise CampusNotFoundError(campus_id)
        return self._campuses[campus_id]

    def create_campus(self, name: str, code: str, description: Optional[str] = None) -> Campus:
        new_id = str(uuid.uuid4())
        campus = Campus(id=new_id, name=name, code=code, description=description)
        self._campuses[new_id] = campus
        return campus

    # --- Location Operations ---
    def list_locations(self, campus_id: str) -> List[Location]:
        if campus_id not in self._campuses:
            raise CampusNotFoundError(campus_id)
        return [loc for loc in self._locations.values() if loc.campus_id == campus_id]

    def get_location(self, location_id: str) -> Location:
        if location_id not in self._locations:
            raise EntityNotFoundError("location", location_id)
        return self._locations[location_id]

    def create_location(
        self,
        campus_id: str,
        name: str,
        code: str,
        location_type: LocationType,
        description: Optional[str] = None,
        capacity: int = 0,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> Location:
        self.get_campus(campus_id)
        new_id = str(uuid.uuid4())
        location = Location(
            id=new_id,
            campus_id=campus_id,
            name=name,
            code=code,
            location_type=location_type,
            description=description,
            capacity=capacity,
            status=status,
        )
        self._locations[new_id] = location
        return location

    # --- Resource Operations ---
    def list_resources(self, campus_id: str) -> List[Resource]:
        if campus_id not in self._campuses:
            raise CampusNotFoundError(campus_id)
        return [res for res in self._resources.values() if res.campus_id == campus_id]

    def get_resource(self, resource_id: str) -> Resource:
        if resource_id not in self._resources:
            raise EntityNotFoundError("resource", resource_id)
        return self._resources[resource_id]

    def create_resource(
        self,
        campus_id: str,
        name: str,
        code: str,
        resource_type: ResourceType,
        location_id: Optional[str] = None,
        description: Optional[str] = None,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> Resource:
        self.get_campus(campus_id)
        if location_id:
            self.get_location(location_id)

        new_id = str(uuid.uuid4())
        resource = Resource(
            id=new_id,
            campus_id=campus_id,
            location_id=location_id,
            name=name,
            code=code,
            resource_type=resource_type,
            description=description,
            status=status,
        )
        self._resources[new_id] = resource
        return resource

    # --- Service Operations ---
    def list_services(self, campus_id: str) -> List[CampusService]:
        if campus_id not in self._campuses:
            raise CampusNotFoundError(campus_id)
        return [svc for svc in self._services.values() if svc.campus_id == campus_id]

    def get_service(self, service_id: str) -> CampusService:
        if service_id not in self._services:
            raise EntityNotFoundError("service", service_id)
        return self._services[service_id]

    def create_service(
        self,
        campus_id: str,
        name: str,
        code: str,
        service_type: ServiceType,
        location_id: Optional[str] = None,
        description: Optional[str] = None,
        status: StructuralStatus = StructuralStatus.ACTIVE,
    ) -> CampusService:
        self.get_campus(campus_id)
        if location_id:
            self.get_location(location_id)

        new_id = str(uuid.uuid4())
        service = CampusService(
            id=new_id,
            campus_id=campus_id,
            location_id=location_id,
            name=name,
            code=code,
            service_type=service_type,
            description=description,
            status=status,
        )
        self._services[new_id] = service
        return service

    # --- Entity Resolution & Validation ---
    def validate_entity_exists(self, campus_id: str, entity_type: CampusEntityType, entity_id: str):
        """Validate polymorphic entity existence and campus matching."""
        if entity_type == CampusEntityType.RESOURCE:
            res = self.get_resource(entity_id)
            if res.campus_id != campus_id:
                raise InvalidDependencyError(f"Resource {entity_id} does not belong to campus {campus_id}")
        elif entity_type == CampusEntityType.LOCATION:
            loc = self.get_location(entity_id)
            if loc.campus_id != campus_id:
                raise InvalidDependencyError(f"Location {entity_id} does not belong to campus {campus_id}")
        elif entity_type == CampusEntityType.SERVICE:
            svc = self.get_service(entity_id)
            if svc.campus_id != campus_id:
                raise InvalidDependencyError(f"Service {entity_id} does not belong to campus {campus_id}")
        else:
            raise InvalidDependencyError(f"Unsupported entity type '{entity_type}'")

    def get_entity_name(self, entity_type: CampusEntityType, entity_id: str) -> str:
        if entity_type == CampusEntityType.RESOURCE:
            return self.get_resource(entity_id).name
        elif entity_type == CampusEntityType.LOCATION:
            return self.get_location(entity_id).name
        elif entity_type == CampusEntityType.SERVICE:
            return self.get_service(entity_id).name
        return entity_id

    # --- Dependency Operations ---
    def list_dependencies(self, campus_id: str) -> List[Dependency]:
        if campus_id not in self._campuses:
            raise CampusNotFoundError(campus_id)
        return [dep for dep in self._dependencies.values() if dep.campus_id == campus_id]

    def get_dependency(self, dependency_id: str) -> Dependency:
        if dependency_id not in self._dependencies:
            raise EntityNotFoundError("dependency", dependency_id)
        return self._dependencies[dependency_id]

    def create_dependency(
        self,
        campus_id: str,
        source_type: CampusEntityType,
        source_id: str,
        target_type: CampusEntityType,
        target_id: str,
        dependency_type: DependencyType,
        strength: DependencyStrength = DependencyStrength.CRITICAL,
        description: Optional[str] = None,
    ) -> Dependency:
        self.get_campus(campus_id)

        # Self-dependency check
        if source_type == target_type and source_id == target_id:
            raise SelfDependencyError(source_id)

        # Endpoint existence & campus ownership validation
        self.validate_entity_exists(campus_id, source_type, source_id)
        self.validate_entity_exists(campus_id, target_type, target_id)

        # Duplicate edge check
        for dep in self._dependencies.values():
            if (
                dep.campus_id == campus_id
                and dep.source_type == source_type
                and dep.source_id == source_id
                and dep.target_type == target_type
                and dep.target_id == target_id
                and dep.dependency_type == dependency_type
            ):
                raise DuplicateDependencyError(source_id, target_id, dependency_type.value)

        new_id = str(uuid.uuid4())
        dependency = Dependency(
            id=new_id,
            campus_id=campus_id,
            source_type=source_type,
            source_id=source_id,
            target_type=target_type,
            target_id=target_id,
            dependency_type=dependency_type,
            strength=strength,
            description=description,
        )
        self._dependencies[new_id] = dependency
        return dependency

    def delete_dependency(self, dependency_id: str) -> bool:
        if dependency_id not in self._dependencies:
            raise EntityNotFoundError("dependency", dependency_id)
        del self._dependencies[dependency_id]
        return True

    # --- Graph Reconstruction ---
    def get_campus_graph(self, campus_id: str) -> CampusGraph:
        self.get_campus(campus_id)
        locations = self.list_locations(campus_id)
        resources = self.list_resources(campus_id)
        services = self.list_services(campus_id)
        dependencies = self.list_dependencies(campus_id)
        return build_campus_graph(campus_id, locations, resources, services, dependencies)


# Global singleton instance
campus_repository = CampusRepository()
