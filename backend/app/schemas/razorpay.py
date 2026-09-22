from pydantic import BaseModel

class CreateOrderRequest(BaseModel):
    user_id:int
    appointment_id:int
    amount:float