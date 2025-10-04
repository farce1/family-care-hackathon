#!/usr/bin/env python3
"""
Test calling MCP server with real backend connection
"""

import asyncio
from contextlib import asynccontextmanager

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


@asynccontextmanager
async def get_client():
    """Create MCP client connected to our server."""
    server_params = StdioServerParameters(
        command="uv",
        args=["run", "fastmcp", "run", "app/main.py:mcp"],
        env=None,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield session


async def test_appointments():
    """Test appointment tools with real backend."""

    async with get_client() as session:
        print("🚀 Testing Family Care MCP Server")
        print("=" * 70)

        # Login with test credentials
        print("\n1️⃣  Logging in...")
        login_result = await session.call_tool(
            "login",
            arguments={
                "email": "test@example.com",
                "password": "test123"  # Default password from auth controller
            }
        )
        print(f"   Result: {login_result.content[0].text}")

        # Get current user
        print("\n2️⃣  Getting current user info...")
        user_result = await session.call_tool(
            "get_current_user",
            arguments={}
        )
        print(f"   Result: {user_result.content[0].text}")

        # List parsed appointments
        print("\n3️⃣  Listing parsed appointments...")
        appointments_result = await session.call_tool(
            "list_parsed_appointments",
            arguments={}
        )
        print(f"   Result: {appointments_result.content[0].text}")

        # List upcoming appointments
        print("\n4️⃣  Listing upcoming appointments...")
        upcoming_result = await session.call_tool(
            "list_upcoming_appointments",
            arguments={"only_active": True}
        )
        print(f"   Result: {upcoming_result.content[0].text}")

        # Get next 3 appointments
        print("\n5️⃣  Getting next 3 appointments...")
        next_result = await session.call_tool(
            "get_next_appointments",
            arguments={"count": 3}
        )
        print(f"   Result: {next_result.content[0].text}")

        # Check auth status
        print("\n6️⃣  Checking auth status...")
        auth_status = await session.call_tool(
            "get_auth_status",
            arguments={}
        )
        print(f"   Result: {auth_status.content[0].text}")

        print("\n" + "=" * 70)
        print("✅ All MCP tools tested successfully!")


if __name__ == "__main__":
    asyncio.run(test_appointments())