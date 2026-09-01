from sqlalchemy.orm import Session
from fastapi import HTTPException,APIRouter, Depends
from app.db.session import get_db
from app.models.medical_test import MedicalTest
from app.schemas.medical_test import MedicalTestCreate

router=APIRouter(
    prefix="/medical_tests",
    tags=["Medical Tests"]
)

@router.post("/")
def create_test(test:MedicalTestCreate,db:Session=Depends(get_db)):

    db_test=MedicalTest(
        name=test.name,
        category=test.category,
        description=test.description
    )

    db.add(db_test)
    db.commit()
    db.refresh(db_test)


    return db_test




@router.get("/")
def get_tests(db:Session=Depends(get_db)):

    return db.query(MedicalTest).all()


@router.get("/{test_id}")
def get_test(
    test_id:int,
    db:Session=Depends(get_db)
):

   test=db.query(MedicalTest).filter(
       MedicalTest.id==test_id
   ).first()


   if not test:

       raise HTTPException(
           status_code=404,
           detail="test not found"
       )

   return test


@router.delete("/{test_id}")
def get_delete(
    test_id:int,
    db:Session=Depends(get_db)
):


    test=db.query(MedicalTest).filter(
        MedicalTest.id==test_id
    ).first()

    if not test:

        raise HTTPException(
            Status_code=404,
            detail="test not found"
        )

    db.delete(test)
    db.commit()


    return {
        "Message":"test deleted successfully"
    }

    


