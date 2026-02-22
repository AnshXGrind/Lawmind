"""
Smoke tests — verify the app can be imported and core config loads.
No external services required (Gemini/DB mocked via env vars in CI).
"""

import os
import pytest

# Ensure dummy env vars are set so config doesn't raise on missing secrets
os.environ.setdefault("GEMINI_API_KEY", "dummy-ci-key")
os.environ.setdefault("SECRET_KEY", "ci-test-secret-key")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_smoke.db")


def test_settings_load():
    """Core settings object can be imported and accessed."""
    from app.core.config import settings

    assert settings.APP_NAME == "LawMind"
    assert settings.LLM_MODEL == "gemini-1.5-flash"
    assert "http://localhost:3000" in settings.CORS_ORIGINS


def test_schemas_importable():
    """Pydantic schemas can be imported without errors."""
    from app.models.schemas import DraftRequest, CitationSearch, CaseType, DocumentType

    assert CaseType.CRIMINAL is not None
    assert DocumentType.PETITION is not None


def test_draft_request_validation():
    """DraftRequest schema validates correctly."""
    from app.models.schemas import DraftRequest, CaseType, DocumentType, CourtLevel

    req = DraftRequest(
        title="Test Petition",
        case_type=CaseType.CRIMINAL,
        document_type=DocumentType.PETITION,
        court=CourtLevel.HIGH_COURT,
        facts="The accused was arrested without a warrant.",
        relief_sought="Bail should be granted.",
        parties={"petitioner": "Ramesh Kumar", "respondent": "State of Delhi"},
    )
    assert req.title == "Test Petition"


def test_citation_search_schema():
    """CitationSearch schema validates correctly."""
    from app.models.schemas import CitationSearch

    search = CitationSearch(query="fundamental rights Article 21", limit=5)
    assert search.limit == 5


def test_quality_service_importable():
    """QualityScorer can be instantiated without external dependencies."""
    from app.services.quality_service import QualityScorer

    qs = QualityScorer()
    assert qs is not None


def test_rbac_roles():
    """RBAC UserRole enum has expected members."""
    from app.services.rbac_service import UserRole

    assert UserRole.ADMIN == "admin"
    assert UserRole.ADVOCATE == "advocate"
