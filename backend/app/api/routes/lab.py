from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2

from app.db.session import get_db
from app.models.lab import Lab
from app.schemas.lab import LabCreate, LabResponse

router = APIRouter(
    prefix="/lab",
    tags=["Labs"]
)


# --------------------------------------------------
# Distance Calculation (Haversine Formula)
# --------------------------------------------------

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in KM

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(R * c, 2)


# --------------------------------------------------
# Create Lab
# --------------------------------------------------

@router.post("/", response_model=LabResponse)
def create_lab(
    lab: LabCreate,
    db: Session = Depends(get_db)
):
    db_lab = Lab(
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


# --------------------------------------------------
# Get All Labs
# --------------------------------------------------

@router.get("/", response_model=list[LabResponse])
def get_labs(
    db: Session = Depends(get_db)
):
    return db.query(Lab).all()


# --------------------------------------------------
# Top Rated Labs
# --------------------------------------------------

@router.get("/top-rated", response_model=list[LabResponse])
def get_top_rated_labs(
    db: Session = Depends(get_db)
):
    return (
        db.query(Lab)
        .order_by(Lab.rating.desc())
        .limit(10)
        .all()
    )


# --------------------------------------------------
# Nearby Labs
# IMPORTANT:
# Keep this ABOVE /{lab_id}
# --------------------------------------------------

@router.get("/nearby")
def nearby_labs(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db)
):
    labs = db.query(Lab).all()

    result = []

    for lab in labs:

        distance = calculate_distance(
            lat,
            lng,
            lab.latitude,
            lab.longitude
        )

        result.append({
            "id": lab.id,
            "name": lab.name,
            "address": lab.address,
            "phone": lab.phone,
            "rating": lab.rating,
            "latitude": lab.latitude,
            "longitude": lab.longitude,
            "distance_km": distance
        })

    result.sort(
        key=lambda x: x["distance_km"]
    )

    return result


# --------------------------------------------------
# Get Single Lab
# IMPORTANT:
# Keep BELOW /nearby
# --------------------------------------------------

@router.get("/{lab_id}")
def get_lab(
    lab_id: int,
    db: Session = Depends(get_db)
):
    lab = (
        db.query(Lab)
        .filter(Lab.id == lab_id)
        .first()
    )

    if not lab:
        raise HTTPException(
            status_code=404,
            detail="Lab not found"
        )

    return lab


# --------------------------------------------------
# Delete Lab
# --------------------------------------------------

@router.delete("/{lab_id}")
def delete_lab(
    lab_id: int,
    db: Session = Depends(get_db)
):
    lab = (
        db.query(Lab)
        .filter(Lab.id == lab_id)
        .first()
    )

    if not lab:
        raise HTTPException(
            status_code=404,
            detail="Lab not found"
        )

    db.delete(lab)
    db.commit()

    return {
        "message": "Lab deleted successfully"
    }