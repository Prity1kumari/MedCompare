from datetime import datetime

from sqlalchemy import ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LabSlot(Base):
    __tablename__ = "lab_slots"

    id: Mapped[int] = mapped_column(primary_key=True)

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("labs.id")
    )

    slot_time: Mapped[datetime] = mapped_column(
        DateTime
    )

    is_booked: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )