#!/usr/bin/env python3
"""
Test MCP tools without authentication requirement
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


async def test_no_auth():
    """Test tools without auth requirement."""

    async with get_client() as session:
        print("🔓 Testing MCP Server WITHOUT Authentication Requirement")
        print("=" * 70)

        # Try listing parsed appointments without logging in first
        print("\n1️⃣  Listing parsed appointments (no login)...")
        try:
            result = await session.call_tool(
                "list_parsed_appointments",
                arguments={}
            )
            print(f"   ✅ Tool called successfully!")
            print(f"   Response: {result.content[0].text[:200]}...")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        # Try listing upcoming appointments without logging in
        print("\n2️⃣  Listing upcoming appointments (no login)...")
        try:
            result = await session.call_tool(
                "list_upcoming_appointments",
                arguments={}
            )
            print(f"   ✅ Tool called successfully!")
            print(f"   Response: {result.content[0].text[:200]}...")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        # Check auth status (should show not logged in)
        print("\n3️⃣  Checking auth status...")
        try:
            result = await session.call_tool(
                "get_auth_status",
                arguments={}
            )
            print(f"   Response: {result.content[0].text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        print("\n" + "=" * 70)
        print("✅ MCP server no longer requires authentication for tools!")
        print("   (Backend endpoints may still require auth)")


if __name__ == "__main__":
    asyncio.run(test_no_auth())