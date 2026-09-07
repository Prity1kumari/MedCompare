from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(
    prefix="/payment",
    tags=["Payments"]
)


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db)
):
    db_payment = Payment(
        user_id=payment.user_id,
        appointment_id=payment.appointment_id,
        amount=payment.amount,
        payment_status=payment.payment_status
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("", response_model=list[PaymentResponse])
@router.get("/", response_model=list[PaymentResponse], include_in_schema=False)
def get_all_payments(
    db: Session = Depends(get_db)
):
    return db.query(Payment).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment
