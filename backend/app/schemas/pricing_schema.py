from typing import Literal

from pydantic import BaseModel, Field


class PricingCalculateRequest(BaseModel):
    package_id: str = Field(
        min_length=2,
        max_length=64,
        description="Wash tier slug (e.g. basic, super_deluxe)",
    )
    vehicle_size: Literal["compact", "sedan", "suv"] = Field(description="Vehicle size category")


class PricingCalculateResponse(BaseModel):
    estimated_price_cents: int
    currency: str = "INR"
    package_id: str
    vehicle_size: str
    notes: str | None = None
