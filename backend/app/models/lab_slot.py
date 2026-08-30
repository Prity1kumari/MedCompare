from sqlalchemy import Date, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class LabSlot(Base):
    __tablename__ = "LabSlot"

    id: Mapped[int] = mapped_column(primary_key=True)

    lab_id: Mapped[int]
    test_price_id: Mapped[int]

    date: Mapped[str]
    start_time: Mapped[str]
    end_time: Mapped[str]

    is_booked: Mapped[bool] = mapped_column(default=False)