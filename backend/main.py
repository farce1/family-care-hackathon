from fastapi import FastAPI
from controllers.appointments import router as appointments_router

app = FastAPI()

# Include routers
app.include_router(appointments_router)

@app.get("/hello")
async def hello():
    return {"message": "world"}