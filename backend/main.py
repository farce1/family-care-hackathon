from fastapi import FastAPI
from controllers.upcoming_appointments import router as upcoming_router
from controllers.appointments import router as appointments_router
from controllers.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from models import Base

app = FastAPI()

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

@app.get("/hello")
async def hello():
    return {"message": "world"}