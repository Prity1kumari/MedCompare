from pydantic import BaseModel


class MedicalTestCreate(BaseModel):
    name:str
    category:str
    description:str



class MedicalTestResponse(BaseModel):
    id:int

    class config:
        from_attributes=True
