class EqualyzeError(Exception):
    """Base exception for all Equalyze SDK errors."""
    pass

class EqualyzeAPIError(EqualyzeError):
    """Raised when the API responds with an error (e.g., 500 Server Error)."""
    def __init__(self, message: str, status_code: int = None, response_data: dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data

class EqualyzeAuthenticationError(EqualyzeAPIError):
    """Raised when authentication fails (401/403)."""
    pass

class EqualyzeRateLimitError(EqualyzeAPIError):
    """Raised when the API rate limit is exceeded (429)."""
    pass

class EqualyzeTimeoutError(EqualyzeError):
    """Raised when a polling operation times out."""
    pass

class DatasetValidationError(EqualyzeError):
    """Raised when dataset fails pre-flight validation."""
    pass
