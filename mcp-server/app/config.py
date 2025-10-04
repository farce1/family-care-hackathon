from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mcp_server_name: str = "Family Care MCP Server"
    backend_url: str = "http://backend:8000"

    # When running locally without Docker, use:
    # backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


settings = Settings()