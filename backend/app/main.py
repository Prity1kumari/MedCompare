from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from app.api.routes.auth import router as auth_router

from app.api.routes.lab import router as lab_router


from app.api.routes.medical_test import router as medical_test_router

from app.api.routes.test_price import router as test_price_router

from app.api.routes.lab_slots import router as Lab_slot_router

from app.api.routes.appointments import router as appointment_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.payment import router as payment_router
from app.api.routes.review import router as review_router
from app.api.routes.search import router as search_router

from app.api.routes.slots import router as slots_router
from fastapi.middleware.cors import CORSMiddleware



app=FastAPI(
    title="MedCompare API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(lab_router)
app.include_router(medical_test_router)
app.include_router(test_price_router)
app.include_router(Lab_slot_router)
app.include_router(appointment_router)
app.include_router(dashboard_router)
app.include_router(payment_router)
app.include_router(review_router)
app.include_router(search_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"Message":"My first fastApi "}