# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Care is a comprehensive health management platform that helps users manage their family's medical records, appointments, and wellness information. The system uses AI to parse medical documents (PDFs) and extract structured appointment data.

**Key capabilities:**
- PDF medical record parsing using OpenAI GPT-3.5-turbo with OCR fallback (pytesseract + pdf2image)
- JWT-based authentication (email-only login)
- PostgreSQL database with SQLAlchemy ORM and Alembic migrations
- Next.js 15 frontend with React 19, TanStack Query, and shadcn/ui components

## Architecture

### Two-tier Application Structure

1. **Frontend (Next.js 15)**: `frontend/`
   - App Router with route groups: `(dashboard)` for authenticated pages
   - API layer in `lib/api/` with centralized configuration
   - Component structure: `components/ui/` (shadcn), `components/*` (custom)
   - Key routes:
     - `/` - Dashboard with health statistics
     - `/family` - Family members list
     - `/family/[id]` - Individual family member details
     - `/login` - Authentication page

2. **Backend (FastAPI)**: `backend/`
   - Controllers: `controllers/auth.py`, `controllers/appointments.py`
   - Database models: `models.py` (User, ParsedAppointment)
   - Utilities: `utils.py` (default user management)
   - Database migrations: `alembic/versions/`
   - Default user created on startup for no-auth operations

### Database Schema

**Users Table:**
- Primary auth via email only (no passwords)
- UUID primary keys
- Timestamps: created_at, updated_at, last_login

**ParsedAppointments Table:**
- Linked to users via user_id (UUID foreign key with CASCADE delete)
- Stores original PDF as BYTEA in `raw_file_data`
- Fields: name, date, appointment_type, summary, doctor, file_size
- Processing metadata: confidence_score (0-100), processing_status
- Valid appointment types: General Checkup, Dental, Vision, Specialist, Vaccination, Follow-up, Emergency, Lab Work, Physical Therapy, Mental Health, Veterinary, Other

### PDF Processing Pipeline

The `/parse-pdf` endpoint implements sophisticated document processing:

1. **Text Extraction** (`backend/controllers/appointments.py:119-216`):
   - Tries 4 rotations (0°, 90°, 180°, 270°) using PyPDF2
   - Falls back to OCR (pytesseract) if regular extraction fails
   - Supports Polish and English OCR

2. **AI Parsing**:
   - Uses GPT-3.5-turbo with temperature=0.1 for consistency
   - Extracts structured data: name, date, appointment_type, summary, doctor, confidence_score
   - Comprehensive medical summary generation with patient-friendly explanations

3. **Validation**:
   - Rejects documents with confidence_score < 51
   - Validates date format (YYYY-MM-DD), defaults to current date if invalid
   - Checks required fields: name, date, summary, doctor
   - Sets appointment_type to "Other" if invalid but confidence > 51

4. **Storage**:
   - Saves parsed data to database linked to default user
   - Stores original PDF bytes in raw_file_data column

## Development Commands

### Frontend (from `frontend/`)

```bash
npm install              # Install dependencies
npm run dev              # Development server with Turbopack
npm run build            # Production build with Turbopack
npm start                # Start production server
npm run lint             # Run oxlint
npm run lint:fix         # Run oxlint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Backend (from `backend/`)

```bash
# Setup
pip install -r requirements.txt

# Environment variables required:
# - OPENAI_API_KEY or API_KEY (for PDF parsing)
# - DATABASE_URL (defaults to Docker Compose URL)
# - SECRET_KEY (for JWT, defaults to "your-secret-key-here")

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic upgrade head     # Apply all migrations
alembic revision --autogenerate -m "description"  # Create new migration

# Linting and formatting
ruff check .             # Check code
ruff check --fix .       # Fix auto-fixable issues
ruff format .            # Format code
```

### Docker Compose (from project root)

```bash
docker-compose up --build           # Start all services
docker-compose down                 # Stop all services
docker-compose logs -f backend      # View backend logs

# Services and ports:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Backend API docs: http://localhost:8000/docs
# - PostgreSQL: localhost:5434

# Create test user:
curl -X POST "http://localhost:8000/auth/create-test-user?email=test@example.com&first_name=Test&last_name=User"
```

### Testing

Backend tests are located in `backend/tests/` but test commands are not configured in requirements.txt. To run tests:

```bash
cd backend
pytest                   # Run all tests
pytest -v               # Verbose output
pytest tests/test_specific.py  # Run specific test file
```

## Important Implementation Details

### Authentication Flow
- Email-only authentication (no passwords)
- JWT tokens expire after 30 minutes
- `/auth/login` returns token + user info
- `/auth/me` gets current user from Bearer token
- Frontend stores token and uses it in API calls

### Environment Configuration
- Frontend: `NEXT_PUBLIC_API_URL` for API base URL (falls back to localhost:8000)
- Backend database URL can be overridden via `DATABASE_URL` env var
- Default database: `postgresql://familycare:familycare@postgres:5432/familycare`

### CORS Configuration
Backend allows all origins (`allow_origins=["*"]`) - should be restricted in production.

### Default User
- Created automatically on backend startup
- Email: mcpuser@example.com
- Used for PDF parsing when no user is authenticated
- Managed by `utils.get_default_mcp_user()`

### Code Style
- **Backend**: Ruff with line length 100, Python 3.11 target
  - Auto-fixes enabled for most rules
  - Follows Black style for formatting
  - Ignores E501 (line too long, handled by formatter)
- **Frontend**: Prettier + oxlint
  - Uses Turbopack for dev and build
  - Next.js 15 with standalone output mode

## Common Patterns

### Adding a New API Endpoint

1. Add route to appropriate controller in `backend/controllers/`
2. Define Pydantic request/response models if needed
3. Use `Depends(get_db)` for database access
4. Add endpoint to `frontend/lib/api/config.ts` constants
5. Create API function in appropriate `frontend/lib/api/*.ts` file
6. Use TanStack Query hooks in components

### Creating Database Migration

```bash
cd backend
# 1. Modify models.py
# 2. Generate migration
alembic revision --autogenerate -m "add new field to users"
# 3. Review generated migration in alembic/versions/
# 4. Apply migration
alembic upgrade head
```

### Adding a New Frontend Route

1. Create directory in `frontend/app/(dashboard)/` for authenticated routes
2. Add `page.tsx` file with the component
3. Update `frontend/components/app-sidebar.tsx` if adding to navigation
4. Use `"use client"` directive if using hooks or client-side features

## API Documentation

Backend FastAPI auto-generates OpenAPI docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
