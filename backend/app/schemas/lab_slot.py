from datetime import datetime
from pydantic import BaseModel

class SlotCreate(BaseModel):
    lab_id:int
    slot_time:datetime



class Slotresponse(BaseModel):
    id:int
    lab_id:int
    slot_time:datetime
    is_booked:bool

    class Config:
        from_attributes=True