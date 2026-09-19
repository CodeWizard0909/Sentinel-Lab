"""Issue schemas — types, severity, issue model."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class IssueType(str, Enum):
    """Categories of code issues."""
    LOGIC_BUG = "LOGIC_BUG"
    SECURITY = "SECURITY"
    CODE_QUALITY = "CODE_QUALITY"
    PERFORMANCE = "PERFORMANCE"
    SQL_INJECTION = "SQL_INJECTION"
    COMMAND_INJECTION = "COMMAND_INJECTION"
    XSS = "XSS"
    HARDCODED_SECRET = "HARDCODED_SECRET"
    UNSAFE_INPUT = "UNSAFE_INPUT"
    INSECURE_AUTH = "INSECURE_AUTH"


class IssueSeverity(str, Enum):
    """Issue severity levels."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class Issue(BaseModel):
    """A single code issue found by an agent."""
    id: str
    type: IssueType
    severity: IssueSeverity
    file: str
    line: int
    description: str
    recommendation: str = ""
    agent: str = ""  # Which agent found it
