from pydantic import BaseModel

class LabCreate(BaseModel):
    name:str
    address:str
    latitude:float
    longitude:float
    phone:str
    rating:float


class LabResponse(LabCreate):
    id:int

    class config:
        from_attributes=True 