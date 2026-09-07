from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DashboardUserResponse(BaseModel):
    name: str
    email: str
    total_appointments: int
    total_payments: int

    model_config = ConfigDict(
        from_attributes=True
    )


class AppointmentDashboardResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
