import logging
import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from controllers.appointments import router as appointments_router
from controllers.auth import router as auth_router
from controllers.upcoming_appointments import router as upcoming_router
from models import User

# Configure logging to output to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)

# Database setup
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://familycare:familycare@postgres:5432/familycare"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()

# Default MCP user configuration
DEFAULT_MCP_USER = {"email": "mcpuser@example.com", "first_name": "MCP", "last_name": "User"}


@app.on_event("startup")
async def startup_event():
    """Create default MCP user on startup if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if default MCP user exists
        existing_user = db.query(User).filter(User.email == DEFAULT_MCP_USER["email"]).first()

        if not existing_user:
            # Create default MCP user
            default_user = User(
                email=DEFAULT_MCP_USER["email"],
                first_name=DEFAULT_MCP_USER["first_name"],
                last_name=DEFAULT_MCP_USER["last_name"],
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print(
                f"✅ Created default MCP user: {DEFAULT_MCP_USER['email']} (ID: {default_user.id})"
            )
        else:
            print(
                f"✅ Default MCP user already exists: {DEFAULT_MCP_USER['email']} (ID: {existing_user.id})"
            )
    except Exception as e:
        print(f"❌ Error creating default MCP user: {e}")
        db.rollback()
    finally:
        db.close()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(appointments_router)
app.include_router(upcoming_router)
