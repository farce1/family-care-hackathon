FROM python:3.13-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml README.md ./
COPY app ./app

# Install dependencies
RUN uv sync --no-dev

# Expose port for HTTP transport
EXPOSE 8888

# Run the MCP server with HTTP transport
CMD ["uv", "run", "fastmcp", "run", "app/main.py", "--transport", "http", "--host", "0.0.0.0", "--port", "8888"]