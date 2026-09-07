from fastapi import APIRouter,Depends,HTTPException

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.lab import Lab
from app.schemas.lab import LabCreate, LabResponse


router=APIRouter(
    prefix="/lab",
    tags=["Labs"]
)

@router.post("/")
def create_lab(
    lab:LabCreate,
    db:Session=Depends(get_db)
):

    db_lab=Lab(
        name=lab.name,
        address=lab.address,
        latitude=lab.latitude,
        longitude=lab.longitude,
        phone=lab.phone,
        rating=lab.rating

    )

    db.add(db_lab)
    db.commit()
    db.refresh(db_lab)
    return db_lab



@router.get("/")
def get_labs(db:Session=Depends(get_db)):

    return db.query(Lab).all()



@router.get("/top-rated", response_model=list[LabResponse])
def get_top_rated_labs(db: Session = Depends(get_db)):
    return db.query(Lab).order_by(Lab.rating.desc()).limit(10).all()



@router.get("/{lab_id}")
def get_lab(
    lab_id:int,
    db:Session=Depends(get_db)
):
    lab=db.query(Lab).filter(
        Lab.id==lab_id
    ).first()


    if not lab:
        raise HTTPException(
            status_code=404,
            detail="Lab not found"
        )

    return lab


@router.delete("/{lab_id}")
def delete_lab(
    lab_id:int,
    db:Session=Depends(get_db)
):


    lab=db.query(Lab).filter(
        Lab.id==lab_id
    ).first()


    if not lab:
        raise HTTPException(
            status_code=404,
            detail="Lab not found"
        )

    db.delete(lab)
    db.commit()

    return {
        "Message":"Lab deleted successfully"
    }


    