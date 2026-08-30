from fastapi import FastAPI
from dotenv import load_dotenv

from app.api.routes.auth import router as auth_router

app=FastAPI(
    title="MedCompare API",
    version="1.0.0"
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"Message":"My first fastApi "}