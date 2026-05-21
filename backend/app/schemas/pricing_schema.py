from typing import Literal

from pydantic import BaseModel, Field


class PricingCalculateRequest(BaseModel):
    package_id: Literal["basic", "deluxe", "super_deluxe", "premium"] = Field(
        description="Wash package tier",
    )
    vehicle_size: Literal["compact", "sedan", "suv"] = Field(description="Vehicle size category")


class PricingCalculateResponse(BaseModel):
    estimated_price_cents: int
    currency: str = "INR"
    package_id: str
    vehicle_size: str
    notes: str | None = None
