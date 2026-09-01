from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class TestPrice(Base):
    __tablename__ = "test_prices"

    id: Mapped[int] = mapped_column(primary_key=True)

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("Lab.id")
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("MedicalTest.id")
    )

    price: Mapped[float] = mapped_column()

    description: Mapped[str] = mapped_column(nullable=True)