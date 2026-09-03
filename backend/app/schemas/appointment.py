from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    user_id:int
    slot_id:int