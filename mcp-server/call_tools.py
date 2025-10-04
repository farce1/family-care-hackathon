#!/usr/bin/env python3
"""
Call MCP server tools directly using stdio transport
"""

import asyncio
import sys
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


async def call_list_appointments():
    """Call the list_parsed_appointments tool."""

    async with get_client() as session:
        print("Connected to MCP server!")
        print("=" * 60)

        # List all available tools
        print("\nListing available tools...")
        tools_result = await session.list_tools()
        print(f"Found {len(tools_result.tools)} tools:")
        for tool in tools_result.tools:
            print(f"  - {tool.name}: {tool.description}")

        print("\n" + "=" * 60)

        # First, we need to login
        print("\n1. Attempting to login...")
        try:
            login_result = await session.call_tool(
                "login",
                arguments={
                    "email": "test@example.com",
                    "password": "test123"
                }
            )
            print(f"Login result: {login_result.content}")
        except Exception as e:
            print(f"Login error (expected - no real backend): {e}")

        print("\n" + "=" * 60)

        # Try to list appointments (will fail without login, but shows the tool works)
        print("\n2. Attempting to list appointments...")
        try:
            appointments_result = await session.call_tool(
                "list_parsed_appointments",
                arguments={}
            )
            print(f"Appointments result: {appointments_result.content}")
        except Exception as e:
            print(f"List appointments result: {e}")

        print("\n" + "=" * 60)

        # Try to get auth status
        print("\n3. Checking auth status...")
        try:
            auth_status = await session.call_tool(
                "get_auth_status",
                arguments={}
            )
            print(f"Auth status: {auth_status.content}")
        except Exception as e:
            print(f"Auth status error: {e}")


if __name__ == "__main__":
    asyncio.run(call_list_appointments())