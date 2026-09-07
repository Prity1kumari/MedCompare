from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int]
    lab_id: Mapped[int]

    rating: Mapped[float] = mapped_column(Float)
    comment: Mapped[str] = mapped_column(String(200))