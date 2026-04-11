"""
Equalyze — SHA-256 Hashing Utilities
"""

import hashlib
import json


def hash_file(file_path: str) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def hash_dict(data: dict) -> str:
    """Compute SHA-256 hash of a JSON-serializable dictionary."""
    json_str = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(json_str.encode()).hexdigest()


def hash_string(text: str) -> str:
    """Compute SHA-256 hash of a string."""
    return hashlib.sha256(text.encode()).hexdigest()
