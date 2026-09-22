from pydantic import BaseModel
from datetime import datetime

class AppointmentCreate(BaseModel):
    user_id:int
    slot_id:int

class AppointmentResponse(BaseModel):
    id:int
    user_id:int
    slot_id:int
    status:str
    created_at:datetime

    class Config:
        from_attributes=True

