from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class TestPrice(Base):
    __tablename__ = "test_prices"

    id: Mapped[int] = mapped_column(primary_key=True)

    lab_id: Mapped[int]
    test_id: Mapped[int]

    price: Mapped[float]

    description: Mapped[str] = mapped_column(String(100))