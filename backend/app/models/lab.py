from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Lab(Base):
    __tablename__ = "labs"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(50))
    address: Mapped[str] = mapped_column(String(100))

    latitude: Mapped[float]
    longitude: Mapped[float]

    phone: Mapped[str] = mapped_column(String(20), unique=True)
    rating: Mapped[float]