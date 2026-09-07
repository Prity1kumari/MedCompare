from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.lab import Lab
from app.models.medical_test import MedicalTest
from app.models.test_price import TestPrice
from app.schemas.search import CompareResponse

router = APIRouter(
    tags=["Search & Compare"]
)


@router.get("/compare/{test_id}", response_model=list[CompareResponse])
@router.get("/search/compare/{test_id}", response_model=list[CompareResponse], include_in_schema=False)
def compare_test_prices(
    test_id: int,
    db: Session = Depends(get_db)
):
    test = db.query(MedicalTest).filter(MedicalTest.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical test not found"
        )

    results = (
        db.query(
            TestPrice.lab_id,
            Lab.name.label("lab_name"),
            MedicalTest.name.label("test_name"),
            TestPrice.price,
            Lab.rating,
            Lab.address
        )
        .join(Lab, TestPrice.lab_id == Lab.id)
        .join(MedicalTest, TestPrice.test_id == MedicalTest.id)
        .filter(TestPrice.test_id == test_id)
        .order_by(TestPrice.price.asc())
        .all()
    )

    return [
        CompareResponse(
            lab_id=row.lab_id,
            lab_name=row.lab_name,
            test_name=row.test_name,
            price=row.price,
            rating=row.rating,
            address=row.address
        )
        for row in results
    ]
