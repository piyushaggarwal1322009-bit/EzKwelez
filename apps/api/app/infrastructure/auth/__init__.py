"""Authentication infrastructure adapters."""

from dataclasses import dataclass
from typing import Optional

from app.config import Settings
from app.domain.campus.models import DEFAULT_CAMPUS_ID


@dataclass(frozen=True)
class DevelopmentPrincipal:
	"""Temporary local identity; it is not a Supabase-authenticated user."""

	actor_id: str = "development-operator"
	campus_id: str = DEFAULT_CAMPUS_ID


def resolve_development_principal(settings: Settings) -> Optional[DevelopmentPrincipal]:
	"""Return the isolated demo principal only when explicitly enabled outside production."""
	if settings.environment.lower() in {"production", "prod"} or not settings.development_auth_bypass:
		return None
	return DevelopmentPrincipal()
