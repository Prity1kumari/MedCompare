from fastapi import FastAPI
from dotenv import load_dotenv

app=FastAPI(
    title="MedCompare API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"Message":"My first fastApi "}