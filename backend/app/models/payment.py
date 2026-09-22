from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int]
    appointment_id: Mapped[int]

    amount: Mapped[float]

    razorpay_order_id:Mapped[str| None]=mapped_column(String(255),
                                                           nullable=True)


    razorpay_payment_id:Mapped[str|None]=mapped_column(
        String(255),
        nullable=True
    )
    payment_status: Mapped[str] = mapped_column(String(50),

      default="pending"  )                                          
                                                
                                                
                                                