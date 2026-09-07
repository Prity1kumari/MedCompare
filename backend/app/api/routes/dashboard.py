from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.appoinments import Appointment
from app.models.payment import Payment
from app.core.dependencies import get_current_user
from app.schemas.user import UserResponse
from app.schemas.dashboard import DashboardUserResponse, AppointmentDashboardResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/history", response_model=list[AppointmentDashboardResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).all()
    return appointments


@router.get("/user", response_model=DashboardUserResponse)
def get_dashboard_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_appointments = db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).count()

    total_payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).count()

    return DashboardUserResponse(
        name=current_user.name,
        email=current_user.email,
        total_appointments=total_appointments,
        total_payments=total_payments
    )
