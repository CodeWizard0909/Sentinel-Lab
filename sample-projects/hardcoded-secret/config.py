"""Configuration with hardcoded secrets — sample for SentinelLab demo.

WARNING: This code has INTENTIONAL security issues for testing purposes.
Do NOT use hardcoded secrets in production.
"""


# VULNERABILITY: Hardcoded API key
API_KEY = "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234"

# VULNERABILITY: Hardcoded database password
DATABASE_PASSWORD = "super_secret_password_123!"

# VULNERABILITY: Hardcoded JWT secret
JWT_SECRET = "my-jwt-secret-key-do-not-share"

# VULNERABILITY: Hardcoded AWS credentials (fake)
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"


class AppConfig:
    """Application configuration with hardcoded values."""

    def __init__(self):
        self.debug = True
        self.host = "0.0.0.0"
        self.port = 8080
        # VULNERABILITY: Using hardcoded credentials
        self.db_url = f"postgresql://admin:{DATABASE_PASSWORD}@localhost:5432/mydb"
        self.api_key = API_KEY
        self.jwt_secret = JWT_SECRET

    def get_headers(self):
        """Return API headers with hardcoded key."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }


def connect_to_aws():
    """Connect to AWS with hardcoded credentials — INSECURE."""
    import boto3

    return boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name="us-east-1",
    )
