from routes.users import router as user_router
from contextlib import asynccontextmanager
from src.database import init_db
from fastapi import FastAPI
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("\nDatabase tables created✅.")
    yield
    print("\nshutting down the app")


app = FastAPI(
    title="People Network Management LLP ADMIN DASHBOARD",
    lifespan=lifespan
)


app.include_router(user_router)


@app.get("/")
def home():
    return {
        "status": "healthy",
        "message": "visit /docs"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
