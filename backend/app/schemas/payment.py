from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    user_id: int
    appointment_id: int
    amount: float
    payment_status: str


class PaymentResponse(BaseModel):
    id: int
    user_id: int
    appointment_id: int
    amount: float
    payment_status: str

    model_config = ConfigDict(
        from_attributes=True
    )
