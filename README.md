# Family Care

## 📋 Table of Contents

- [🔍 About](#-about-the-project)
- [🏗️ Architecture](#arch)
- [🚀 Getting Started](#-getting-started)
  - [🐳 Docker Compose](#docker)
  - [💻 Local Environment](#local)
- [📄 License](#-license)

## 🔍 About The Project

**Family Care** is the perfect comprehensive health management solution designed to keep track of your and your family's complete wellness journey. You no longer will have to search through countless drawers filled with scattered medical papers, remember which specialist you saw last year, or figure out what appointments you need to book next. With Family Care, you can seamlessly manage all of your family's health information, medical history, appointments, medications, and wellness goals in one secure, organized, and easily accessible digital platform. From tracking your toddler's vaccination schedule to managing grandparents' medication routines, Family Care brings clarity and peace of mind to family health management.

### **✨ Key Features**

- Securely store your health information in one place
- Keep the details of you and your family's past appointments by uploading PDFs of your medical records
- Be reminded of outdated medical statistics
- Book next appointments through the NFZ API
- Talk to your data via our MCP server

## **🏗️ Architecture** <a name="arch"></a>

- Frontend build in Next.js
- FastAPI-based backend
- PostgreSQL database storing fragile information
- MCP server for talking to your health data


## **🚀 Getting Started**

Follow these steps to set up Family Care in your environment.

### 🐳 Running with Docker Compose (Recommended) <a name="docker"></a>

**Prerequisites:**
- Docker and Docker Compose installed

**Setup:**
1. Clone the repository:
   ```bash
   git clone https://github.com/farce1/family-care-hackathon.git
   cd family-care-hackathon
   ```

2. Add your OpenAI API key to the backend:
   ```bash
   echo "API_KEY=<your key here>" > backend/.env
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - **Frontend** (Next.js) - http://localhost:3000
   - **Backend** (FastAPI) - http://localhost:8000
   - **PostgreSQL Database** - localhost:5434
   - **MCP Server** - http://localhost:8888

4. Create a test user:
   ```bash
   curl -X POST "http://localhost:8000/auth/create-test-user?email=test@example.com&first_name=Test&last_name=User"
   ```

5. Open the application:
   ```
   http://localhost:3000
   ```

### 💻 Running Individually (Development) <a name="local"></a>

### Frontend (Next.js)

**Prerequisites:**
- Node.js 20+
- npm

**Setup:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

**Other commands:**
```bash
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend (FastAPI)

**Prerequisites:**
- Python 3.12+
- PostgreSQL running locally

**Setup:**
```bash
cd backend
pip install -r requirements.txt

# Set environment variables
echo "API_KEY=<your OpenAI key>" > .env
export DATABASE_URL=postgresql://familycare:familycare@localhost:5434/familycare

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
API documentation: http://localhost:8000/docs

### MCP Server

**Prerequisites:**
- Python 3.12+
- uv package manager (`pip install uv`)

**Setup:**
```bash
cd mcp-server
uv sync

# Run in development mode
uv run fastmcp dev app/main.py:mcp
```

The MCP server will start in development mode.

**Using MCP Inspector:**

The MCP Inspector is a web-based tool for testing and debugging MCP servers.

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run the inspector (from mcp-server directory)
mcp-inspector uv run fastmcp run app/main.py:mcp
```

This will open a browser interface where you can:
- Test MCP tools and resources
- Inspect server capabilities
- Debug tool calls and responses

**Environment Variables for MCP:**
- `BACKEND_URL` - URL of the FastAPI backend (default: http://localhost:8000)

## 📄 License

Distributed under the MIT License. See [MIT License](LICENSE) for more information.
