from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, Request
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
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    email = None
    password = None

    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        email = form.get("username")
        password = form.get("password")
    else:
        try:
            body = await request.json()
            email = body.get("email")
            password = body.get("password")
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid request body"
            )

    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )

    db_user = db.query(User).filter(
        User.email == email
    ).first()

    if not db_user or not verify_password(password, db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": str(db_user.id)
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


    


