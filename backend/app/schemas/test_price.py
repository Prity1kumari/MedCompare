from pydantic import BaseModel

class TestPriceCreate(BaseModel):
    lab_id:int
    test_id:int
    price:float
    descripton:str|None=None


class ComparePriceResponse(BaseModel):
    lab_name: str
    price: int   