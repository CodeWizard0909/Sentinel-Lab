"""Projects endpoint — list sample projects."""

from fastapi import APIRouter

router = APIRouter()

SAMPLE_PROJECTS = [
    {
        "name": "sql-injection",
        "description": "Python app with SQL injection vulnerability",
        "language": "python",
    },
    {
        "name": "logic-bug",
        "description": "Calculator with division-by-zero and off-by-one bugs",
        "language": "python",
    },
    {
        "name": "hardcoded-secret",
        "description": "Configuration with hardcoded API keys and passwords",
        "language": "python",
    },
]


@router.get("/samples")
async def list_sample_projects():
    """Return available sample vulnerable projects."""
    return {"projects": SAMPLE_PROJECTS}
