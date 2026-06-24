from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.booking import BookingStatus


class BookingBase(BaseModel):
    property_id: int
    start_date: datetime
    end_date: datetime
    message: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: BookingStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
