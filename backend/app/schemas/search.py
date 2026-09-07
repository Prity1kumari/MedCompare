from pydantic import BaseModel, ConfigDict


class CompareResponse(BaseModel):
    lab_id: int
    lab_name: str
    test_name: str
    price: float
    rating: float
    address: str

    model_config = ConfigDict(
        from_attributes=True
    )
