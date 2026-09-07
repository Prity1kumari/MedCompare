from pydantic import BaseModel, ConfigDict


class ReviewCreate(BaseModel):
    user_id: int
    lab_id: int
    rating: float
    comment: str


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    lab_id: int
    rating: float
    comment: str

    model_config = ConfigDict(
        from_attributes=True
    )
