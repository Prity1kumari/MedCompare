from sqlalchemy import ForeignKey,String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TestPrice(Base):
    __tablename__ = "test_prices"

    id: Mapped[int] = mapped_column(primary_key=True)

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("labs.id")
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("medical_tests.id")
    )

    price: Mapped[float] = mapped_column()

    description: Mapped[str | None] = mapped_column(
    String(100),
    nullable=True
)