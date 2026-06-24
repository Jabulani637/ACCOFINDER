from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Property, User, UserRole
from schemas import PropertyCreate, PropertyUpdate, PropertyResponse
from core import get_current_user

router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


@router.get("/", response_model=List[PropertyResponse])
def get_properties(
    skip: int = 0,
    limit: int = 100,
    city: str = None,
    verified_only: bool = False,
    db: Session = Depends(get_db)
:
    query = db.query(Property)
    if city:
        query = query.filter(Property.city == city)
    if verified_only:
        query = query.filter(Property.is_verified == True)
    properties = query.offset(skip).limit(limit).all()
    return properties


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return property


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
:
    db_property = Property(**property.model_dump(), owner_id=current_user.id)
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_update: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check ownership or admin
    if property.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property"
        )
    
    update_data = property_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property, key, value)
    db.commit()
    db.refresh(property)
    return property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check ownership or admin
    if property.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this property"
        )
    
    db.delete(property)
    db.commit()
    return
