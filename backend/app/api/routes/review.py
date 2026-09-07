from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/review",
    tags=["Reviews"]
)


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    db_review = Review(
        user_id=review.user_id,
        lab_id=review.lab_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


@router.get("", response_model=list[ReviewResponse])
@router.get("/", response_model=list[ReviewResponse], include_in_schema=False)
def get_all_reviews(
    db: Session = Depends(get_db)
):
    return db.query(Review).all()


@router.get("/lab/{lab_id}", response_model=list[ReviewResponse])
def get_lab_reviews(
    lab_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Review).filter(Review.lab_id == lab_id).all()
