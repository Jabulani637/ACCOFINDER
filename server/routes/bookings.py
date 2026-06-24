from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Booking, Property, User, UserRole
from schemas import BookingCreate, BookingUpdate, BookingResponse
from core import get_current_user

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
:
    if current_user.role == UserRole.ADMIN:
        return db.query(Booking).all()
    elif current_user.role == UserRole.OWNER:
        # Owners can see bookings for their properties
        return db.query(Booking).join(Property).filter(Property.owner_id == current_user.id).all()
    else:
        # Students see their own bookings
        return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
:
    # Check if property exists
    property = db.query(Property).filter(Property.id == booking.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    db_booking = Booking(**booking.model_dump(), user_id=current_user.id)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Only property owner or admin can update booking status
    property = db.query(Property).filter(Property.id == booking.property_id).first()
    if (property.owner_id != current_user.id and 
        current_user.role != UserRole.ADMIN and
        booking.user_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking"
        )
    
    update_data = booking_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return booking
