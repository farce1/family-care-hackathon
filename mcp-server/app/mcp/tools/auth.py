"""Authentication tools for MCP server."""

import httpx
from fastmcp import FastMCP
from pydantic import BaseModel

from app.config import settings

auth_router = FastMCP(name="Authentication")


class LoginCredentials(BaseModel):
    email: str
    password: str


class UserInfo(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Store auth token in memory (in production, use secure storage)
_auth_token: str | None = None


@auth_router.tool
async def login(email: str, password: str) -> dict:
    """
    Login to the Family Care system with email and password.
    Returns an access token for subsequent API calls.

    Args:
        email: User's email address
        password: User's password

    Returns:
        Dictionary with access token and user information
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.backend_url}/auth/login",
                json={"email": email, "password": password}
            )

            if response.status_code == 200:
                data = response.json()
                # Store token for use in other tools
                global _auth_token
                _auth_token = data.get("access_token")
                return {
                    "status": "success",
                    "message": "Successfully logged in",
                    "token": data.get("access_token"),
                    "user": data.get("user")
                }
            else:
                return {
                    "status": "error",
                    "message": f"Login failed: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@auth_router.tool
async def get_current_user() -> dict:
    """
    Get information about the currently logged in user.
    Requires prior login via the login tool.

    Returns:
        Dictionary with user information or error if not logged in
    """
    global _auth_token
    if not _auth_token:
        return {
            "status": "error",
            "message": "Not logged in. Please login first using the login tool."
        }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.backend_url}/auth/me",
                headers={"Authorization": f"Bearer {_auth_token}"}
            )

            if response.status_code == 200:
                return {
                    "status": "success",
                    "user": response.json()
                }
            elif response.status_code == 401:
                _auth_token = None  # Clear invalid token
                return {
                    "status": "error",
                    "message": "Authentication expired. Please login again."
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to get user info: {response.text}",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to backend: {str(e)}"
            }


@auth_router.tool
async def logout() -> dict:
    """
    Logout from the Family Care system.
    Clears the stored authentication token.

    Returns:
        Dictionary with logout status
    """
    global _auth_token
    _auth_token = None
    return {
        "status": "success",
        "message": "Successfully logged out"
    }


@auth_router.tool
async def get_auth_status() -> dict:
    """
    Check if user is currently logged in.

    Returns:
        Dictionary with authentication status
    """
    global _auth_token
    return {
        "logged_in": _auth_token is not None,
        "has_token": _auth_token is not None
    }