from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    location: str
    city: str
    property_type: str
    rooms: int
    bathrooms: int
    amenities: Optional[str] = None  # Comma-separated list


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    is_verified: Optional[bool] = None


class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
