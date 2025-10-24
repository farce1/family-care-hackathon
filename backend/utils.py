"""Utility functions for the backend."""

from sqlalchemy.orm import Session

from models import User

DEFAULT_MCP_USER_EMAIL = "mcpuser@example.com"


def get_default_mcp_user(db: Session) -> User:
    """
    Get or create the default MCP user.
    This user is used for all MCP server operations that don't require authentication.

    Args:
        db: Database session

    Returns:
        The default MCP User instance
    """
    default_user = db.query(User).filter(User.email == DEFAULT_MCP_USER_EMAIL).first()

    if not default_user:
        # Create default user if it doesn't exist (shouldn't happen after startup)
        default_user = User(email=DEFAULT_MCP_USER_EMAIL, first_name="MCP", last_name="User")
        db.add(default_user)
        db.commit()
        db.refresh(default_user)

    return default_user
