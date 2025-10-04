# Family Care MCP Server

This MCP (Model Context Protocol) server provides AI assistants with tools to interact with the Family Care health management system.

## Features

The MCP server exposes the following tool categories:

### Authentication Tools
- `login` - Login to the Family Care system
- `logout` - Logout from the system
- `get_current_user` - Get current user information
- `get_auth_status` - Check authentication status

### Appointment Management Tools
- `parse_pdf_appointment` - Parse PDF medical documents and extract appointment information
- `list_parsed_appointments` - List all parsed appointments with filtering options
- `search_appointments` - Search appointments by various criteria
- `get_appointment_summary` - Get detailed information about a specific appointment

### Upcoming Appointments Tools
- `upload_nfz_appointments` - Upload NFZ appointments from CSV file
- `list_upcoming_appointments` - List upcoming appointments with filtering
- `get_upcoming_appointment` - Get details of a specific upcoming appointment
- `deactivate_appointment` - Mark an appointment as cancelled/completed
- `clear_all_upcoming_appointments` - Delete all upcoming appointments
- `get_next_appointments` - Get the next N upcoming appointments
- `fetch_nfz_appointments` - Fetch real-time available appointments from NFZ API by medical specialty

## Installation

```bash
# From the mcp-server directory
uv sync
```

## Running the Server

### Stdio Transport (for testing with fastmcp)
```bash
uv run fastmcp run app/main.py
```

### HTTP Transport (recommended for production and AI agents)
```bash
uv run fastmcp run app/main.py --transport http --port 8888
```

## Docker Integration

The MCP server is integrated into the docker-compose setup. See the main project's docker-compose.yml for details.

## Configuration

The server uses environment variables for configuration:

- `BACKEND_URL` - URL of the Family Care backend API (default: `http://backend:8000`)
- `MCP_SERVER_NAME` - Name of the MCP server (default: `Family Care MCP Server`)

## Usage with Claude

To use this MCP server with Claude:

1. Start the server with HTTP transport:
   ```bash
   uv run fastmcp run app/main.py --transport http --port 8888
   ```

2. Configure Claude to connect to the MCP server at `http://localhost:8888`

3. Use natural language to interact with the Family Care system through Claude

Example prompts:
- "Login to Family Care with email user@example.com and password mypassword"
- "Show me my upcoming medical appointments"
- "Parse this medical PDF and extract appointment information"
- "Search for appointments with Dr. Smith"
- "Find available cardiology appointments in NFZ system"
- "Fetch available appointments for PORADNIA ALERGOLOGICZNA"

## Development

### Adding New Tools

1. Create a new tool module in `app/mcp/tools/`
2. Define your tools using FastMCP decorators
3. Mount the tool router in `app/mcp/mcp.py`

Example:
```python
from fastmcp import FastMCP

my_router = FastMCP(name="My Tools")

@my_router.tool
async def my_tool(param: str) -> dict:
    """Tool description for AI assistant."""
    return {"result": param}
```

## Testing

```bash
# Run tests
uv run pytest

# Run with coverage
uv run pytest --cov
```

## Architecture

```
mcp-server/
├── app/
│   ├── config.py           # Configuration settings
│   ├── main.py             # Main MCP application
│   └── mcp/
│       ├── mcp.py          # Main MCP router
│       └── tools/          # Tool implementations
│           ├── auth.py     # Authentication tools
│           ├── appointments.py  # Appointment management
│           └── upcoming.py # Upcoming appointments
├── pyproject.toml          # Project dependencies
└── README.md              # This file
```

## Security Notes

- Authentication tokens are stored in memory during the session
- Always use HTTPS in production
- Ensure proper network isolation when running in Docker