from fastmcp import FastMCP

from app.mcp.tools import appointments, upcoming

mcp_router = FastMCP(name="Family Care Tools")

# Mount all tool routers (auth tools removed - not needed)
mcp_router.mount(appointments.appointments_router)
mcp_router.mount(upcoming.upcoming_router)