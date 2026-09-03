
from fastapi import APIRouter,Depends,HTTPException
from app.models.test_price import TestPrice
from app.schemas.test_price import TestPriceCreate
from app.models.lab import Lab

from app.models.medical_test import MedicalTest
from sqlalchemy.orm import Session
from app.db.session import get_db


router=APIRouter(
    prefix="/test_prices",
    tags=["Test_Prices"]
)

@router.post("/")
def create_price(
    price_data:TestPriceCreate,
    db:Session=Depends(get_db)
):

    price=TestPrice(
        lab_id=price_data.lab_id,
        test_id=price_data.test_id,
        price=price_data.price,
        description=price_data.descripton
    )

    db.add(price)
    db.commit()
    db.refresh(price)

    return price


@router.get("/")
def get_price(db:Session=Depends(get_db)):
    return db.query(TestPrice).all()


@router.get("/{price_id}")
def get_price_by_id(
    priceId:int,
    db:Session=Depends(get_db)
):

    price=db.query(TestPrice).filter(
        TestPrice.id==price_id

    ).first()


    if not price:
        raise HTTPException(
            status_code=404,
            detail="Price not found"
        )

    return price


@router.delete("/{price_id}")
def delete_price(
    price_id:int,
    db:Session=Depends(get_db)
):

    price=db.query(TestPrice).filter(
        TestPrice.id==price_id
    ).first()


    if not price:
        raise HTPException(
            status_code=404,
            detail="price not found"
        )

    db.delete(price)
    db.commit()


    return {
        "Message":"price deleted successfully"
    }



@router.get("/search/{test_id}")
def search_test_prices(
    test_id: int,
    db: Session = Depends(get_db)
):
    results = (
        db.query(TestPrice, Lab)
        .join(Lab, TestPrice.lab_id == Lab.id)
        .filter(TestPrice.test_id == test_id)
        .all()
    )

    return [
        {
            "lab_name": lab.name,
            "price": tp.price
        }
        for tp, lab in results
    ]



@router.get("/compare/{test_id}")
def compare_price(
    test_id: int,
    db: Session = Depends(get_db)
):
    test = db.query(MedicalTest).filter(
        MedicalTest.id == test_id
    ).first()

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    results = (
        db.query(TestPrice, Lab)
        .join(Lab, TestPrice.lab_id == Lab.id)
        .filter(TestPrice.test_id == test_id)
        .all()
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail="No prices found"
        )

    prices = [tp.price for tp, lab in results]

    return {
        "test_name": test.name,
        "lowest_price": min(prices),
        "highest_price": max(prices),
        "labs": [
            {
                "lab_name": lab.name,
                "price": tp.price
            }
            for tp, lab in results
        ]
    }


