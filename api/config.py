"""
Equalyze — Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")


class Settings:
    """Application settings loaded from environment variables."""

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_PRO_MODEL: str = "gemini-2.0-flash"
    GEMINI_FLASH_MODEL: str = "gemini-2.0-flash"

    # Server
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Storage
    STORAGE_MODE: str = os.getenv("STORAGE_MODE", "local")
    LOCAL_STORAGE_PATH: Path = ROOT_DIR / os.getenv("LOCAL_STORAGE_PATH", "storage")

    # Paths
    DATASETS_DIR: Path = LOCAL_STORAGE_PATH / "datasets"
    REPORTS_DIR: Path = LOCAL_STORAGE_PATH / "reports"
    REGULATIONS_DIR: Path = ROOT_DIR / "regulations"

    # Ensure directories exist
    @classmethod
    def init_dirs(cls):
        cls.DATASETS_DIR.mkdir(parents=True, exist_ok=True)
        cls.REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # Fairness thresholds
    DEMOGRAPHIC_PARITY_THRESHOLDS = [0.1, 0.2]
    DISPARATE_IMPACT_GREEN = 0.8
    DISPARATE_IMPACT_AMBER = 0.6
    EQUALIZED_ODDS_THRESHOLDS = [0.1, 0.2]
    INDIVIDUAL_FAIRNESS_THRESHOLDS = [0.90, 0.75]

    # Twin generation
    TWIN_QUALITY_THRESHOLD = 0.85
    TWIN_MAX_RETRIES = 3

    # Severity scoring weights
    SEVERITY_WEIGHTS = {
        "disparate_impact": 0.30,
        "demographic_parity": 0.25,
        "legal_exposure": 0.20,
        "twin_quality": 0.15,
        "genealogy_depth": 0.10,
    }


settings = Settings()
settings.init_dirs()
