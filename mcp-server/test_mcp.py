#!/usr/bin/env python3
"""
Simple test script to verify MCP server is working.
Run this after starting the MCP server with HTTP transport.
"""

import asyncio
import httpx
import json


async def test_mcp_server():
    """Test the MCP server endpoints."""

    base_url = "http://localhost:8888"

    print("Testing MCP Server Connection...")
    print("-" * 50)

    async with httpx.AsyncClient() as client:
        try:
            # Test server info endpoint
            response = await client.get(f"{base_url}/")
            print(f"Server Status: {response.status_code}")

            if response.status_code == 200:
                print("✅ MCP Server is running!")
                print(f"Response: {response.json()}")
            else:
                print("❌ MCP Server returned unexpected status")

        except httpx.ConnectError:
            print("❌ Could not connect to MCP server at http://localhost:8888")
            print("Make sure the server is running with:")
            print("  uv run fastmcp run app/main.py --transport http --port 8888")
            return

        print("\n" + "-" * 50)
        print("Available Tools:")
        print("-" * 50)

        # List available tools (this is a conceptual example - actual endpoint may differ)
        try:
            response = await client.get(f"{base_url}/tools")
            if response.status_code == 200:
                tools = response.json()
                for tool in tools:
                    print(f"  - {tool}")
            else:
                print("Could not retrieve tool list")
        except:
            print("Note: Tool listing endpoint may not be available in this version")

    print("\n" + "=" * 50)
    print("MCP Server Test Complete!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test_mcp_server())