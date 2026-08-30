from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,APIRouter
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate,UserLogin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


router=APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user:UserCreate,db:Session=Depends(get_db)):

    existing_user=db.query(User).filter(
        User.email==user.email
    ).first()


    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )



    db_user=User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hash_password(user.password),
        role="user"

    )


    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return{
        "message":"User registered successfully"
    }



@router.post("/login")
def login(user:UserLogin,db:Session=Depends(get_db)):

    db_user=db.query(User).filter(
        User.email==user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    if not verify_password(user.password,db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    token=create_access_token({
        "sub":str(db_user.id)
    })

    return {
        "access_token":token,
        "token_type":"bearer"
    }

    


