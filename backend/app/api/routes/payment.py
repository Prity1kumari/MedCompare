import os

import razorpay



from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentResponse

from app.schemas.razorpay import CreateOrderRequest

from app.schemas.payment_verify import VerifyPaymentRequest




router = APIRouter(
    prefix="/payment",
    tags=["Payments"]
)

client=razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET")
    )
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



@router.get("/test-razorpay")
def test_razorpay():
    return {
        "key": os.getenv("RAZORPAY_KEY_ID"),
        "secret_exists": os.getenv("RAZORPAY_KEY_SECRET") is not None
    }






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



@router.post("/create-order")
def create_order(
    data:CreateOrderRequest,
    db:Session=Depends(get_db)
):

    order=client.order.create({
        "amount":int(data.amount*100),
        "currency":"INR"
    })

    payment=Payment(
        user_id=data.user_id,
        appointment_id=data.appointment_id,
        amount=data.amount,
        payment_status="pending",
        razorpay_order_id=order["id"]
    )

    db.add(payment)
    db.commit()

    return {
        "order_id":order["id"],
        "amount":data.amount,
        "key":os.getenv("RAZORPAY_KEY_ID")
    }



@router.post("/verify")
def verify_payment(
    data:VerifyPaymentRequest,
    db:Session=Depends(get_db)
):

    try:

        client.utility.verify_payment_signature(
            {
                "razorpay_order_id":data.razorpay_order_id,

                "razorpay_payment_id":data.razorpay_payment_id,

                "razorpay_signature":data.razorpay_signature
            }
        )


        payment=db.query(Payment).filter(
            Payment.razorpay_order_id==data.razorpay_order_id
        ).first()


        if not payment:

            raise HTTPException(
                status_code=401,
                detail="payment not found"
            )


        payment.payment_status="paid"

        payment.razorpay_payment_id=(
            data.razorpay_payment_id
        )

        db.commit()

        return {
            "message":"payment verified successfully"
        }


    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Payment verification failed"
        )


