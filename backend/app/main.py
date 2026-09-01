from fastapi import FastAPI
from dotenv import load_dotenv

from app.api.routes.auth import router as auth_router

from app.api.routes.lab import router as lab_router


from app.api.routes.medical_test import router as medical_test_router



app=FastAPI(
    title="MedCompare API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(lab_router)
app.include_router(medical_test_router)

@app.get("/")
def root():
    return {"Message":"My first fastApi "}