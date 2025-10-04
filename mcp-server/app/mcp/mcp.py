from fastmcp import FastMCP

from app.mcp.tools import appointments, auth, upcoming

mcp_router = FastMCP(name="Family Care Tools")

# Mount all tool routers
mcp_router.mount(auth.auth_router)
mcp_router.mount(appointments.appointments_router)
mcp_router.mount(upcoming.upcoming_router)