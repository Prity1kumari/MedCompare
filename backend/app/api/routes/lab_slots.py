from fastapi import APIRouter,Depends,HTTPException
from app.models.lab_slot import LabSlot
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.lab import Lab
from app.schemas.lab_slot import SlotCreate


router=APIRouter(
    prefix="/slots",
    tags=["Slots"]
)


@router.post("/")
def create_slot(
    slot:SlotCreate,
    db:Session=Depends(get_db)
):


    lab=db.query(Lab).filter(
        Lab.id==slot.lab_id
    ).first()

    if not lab:
        raise HTTPException(
            status_code=404,
            detail="Lab not found"
        )

    db_slot=LabSlot(
        lab_id=slot.lab_id,
        slot_time=slot.slot_time
    )

    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)

    return db_slot



@router.get("/")
def get_slots(
    db:Session=Depends(get_db)
):

    return db.query(LabSlot).all()



@router.get("/{lab_id}")
def get_lab_slots(
    lab_id:int,
    db:Session=Depends(get_db)
):

    return db.query(LabSlot).filter(
        LabSlot.lab_id==lab_id
    ).all()



@router.delete("/{slot_id}")
def delete_slot(
    slot_id:int,
    db:Session=Depends(get_db)
):
    slot=db.query(LabSlot).filter(
        LabSlot.id==slot_id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    db.delete(slot)
    db.commit()

    return {
        "Message":"Slot Deleted successfully"
    }


    