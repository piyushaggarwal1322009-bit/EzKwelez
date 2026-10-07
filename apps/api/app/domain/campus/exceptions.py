"""Domain Exceptions for Campus and Dependency entities."""


class CampusDomainError(Exception):
    """Base exception for all campus domain errors."""
    pass


class CampusNotFoundError(CampusDomainError):
    """Raised when a requested campus does not exist."""
    def __init__(self, campus_id: str):
        self.campus_id = campus_id
        super().__init__(f"Campus '{campus_id}' not found.")


class EntityNotFoundError(CampusDomainError):
    """Raised when a campus entity (location, resource, service) is not found."""
    def __init__(self, entity_type: str, entity_id: str):
        self.entity_type = entity_type
        self.entity_id = entity_id
        super().__init__(f"{entity_type.capitalize()} with ID '{entity_id}' not found.")


class DuplicateDependencyError(CampusDomainError):
    """Raised when attempting to create an existing identical dependency edge."""
    def __init__(self, source_id: str, target_id: str, dep_type: str):
        super().__init__(
            f"Dependency edge ({source_id} -> {target_id}, type={dep_type}) already exists."
        )


class SelfDependencyError(CampusDomainError):
    """Raised when an entity attempts to depend on itself."""
    def __init__(self, entity_id: str):
        super().__init__(f"Entity '{entity_id}' cannot create a self-referencing dependency.")


class InvalidDependencyError(CampusDomainError):
    """Raised when dependency endpoints belong to mismatched campuses or invalid types."""
    def __init__(self, message: str):
        super().__init__(message)
