import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import AsyncSessionLocal
from app.db.seed import init_db, seed_data
from app.routers import auth, chat, portal

app = FastAPI(
    title="SGBAU Nexus AI Backend",
    description="Production-Ready chatbot backend with JWT Authentication, OTP Verification, and Thesys AI engine.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(portal.router)

@app.on_event("startup")
async def on_startup():
    print("Starting SGBAU Nexus AI Application...")
    # Initialize tables
    await init_db()
    
    # Run async seed checks
    async with AsyncSessionLocal() as session:
        try:
            await seed_data(session)
        except Exception as e:
            print(f"Error during database seed execution: {e}")
            await session.rollback()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SGBAU Nexus AI Engine",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
