from pydantic import BaseModel,EmailStr

class UserCreate(BaseModel):
    name:str
    email:EmailStr
    phone:str
    password:str


class UserLogin(BaseModel):
    email:EmailStr
    password:str


class UserResponse(BaseModel):
    id:int
    name:str
    email:EmailStr
    phone:str
    role:str 

    class Config:
       from_attributes=True


          