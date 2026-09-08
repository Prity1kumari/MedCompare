from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.models.appoinments import Appointment
from app.schemas.appointment import AppointmentCreate       
from app.models.lab_slot import LabSlot

router=APIRouter(
    prefix="/appointments",
    tags=["Appointments"]

)


@router.post("/book")
def create_appointment(
    appointment:AppointmentCreate,
    db:Session=Depends(get_db)
):

   slot=db.query(LabSlot).filter(
      LabSlot.id==appointment.slot_id
   ).first()
   if not slot:
       raise HTTPException(
           status_code=404,
           detail="Slot not found"
       )

   if slot.is_booked:
       raise HTTPException(
           status_code=400,
           detail="Slot is already booked"
       )

   new_appointment=Appointment(
       user_id=appointment.user_id,
       slot_id=appointment.slot_id,
       status="booked"
   )

   slot.is_booked=True

   db.add(new_appointment)
   db.commit()
   db.refresh(new_appointment)

   return {
       "message":"appointment booked successfully",
       "appointment_id":new_appointment.id
   }


@router.get("/")
def get_user_appointments(
    user_id:int,
    db:Session=Depends(get_db)
):


    return db.query(Appointment).filter(
        Appointment.user_id==user_id
    ).all()


@router.delete("/{appointment_id}")
def cancel_appointment(
    appointment_id:int,
    db:Session=Depends(get_db)
):

    appointment=db.query(Appointment).filter(
        Appointment.id==appointment_id
    ).first()


    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    slot = db.query(LabSlot).filter(
        LabSlot.id == appointment.slot_id
    ).first()

    if slot:
        slot.is_booked=False


    db.delete(appointment)
    db.commit()

    return{
        "message":"Appointment cancelled"
    }    




