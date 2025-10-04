#!/usr/bin/env python3
"""
Test script to call MCP server tools
"""

import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def test_mcp_tools():
    """Test MCP server tools."""

    # For HTTP transport, we need to use the HTTP client
    # Since the server is running on HTTP, let's use httpx to make requests
    import httpx

    base_url = "http://localhost:8888"

    print("Testing MCP Server Tools")
    print("=" * 60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # First, let's try to login (this will fail without real credentials, but shows the tool works)
        print("\n1. Testing login tool...")
        try:
            # MCP protocol request format
            login_request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": "login",
                    "arguments": {
                        "email": "test@example.com",
                        "password": "test123"
                    }
                }
            }

            response = await client.post(
                f"{base_url}/mcp/v1/call_tool",
                json=login_request
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

        # Try listing tools
        print("\n2. Listing all available tools...")
        try:
            list_tools_request = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/list"
            }

            response = await client.post(
                f"{base_url}/mcp/v1/list_tools",
                json=list_tools_request
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                tools = response.json()
                print(f"Available tools: {json.dumps(tools, indent=2)}")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(test_mcp_tools())