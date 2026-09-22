from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from app.db.session import get_db
from app.models.lab_slot import LabSlot


router=APIRouter(
    prefix="/slots",
    tags=["Slots"]
)

@router.get("/{lab_id}")
def get_slots(
    lab_id:int,
    db:Session=Depends(get_db)
):


    Slots=db.query(LabSlot).filter(
        LabSlot.lab_id==lab_id
    ).all()


    return slots
