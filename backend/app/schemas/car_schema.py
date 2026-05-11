from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CarCreate(BaseModel):
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int | None = Field(default=None, ge=1980, le=2035)
    license_plate: str = Field(min_length=1, max_length=32)
    color: str | None = Field(default=None, max_length=64)

    @field_validator("license_plate")
    @classmethod
    def normalize_plate(cls, v: str) -> str:
        return v.strip().upper()


class CarRead(BaseModel):
    id: UUID
    owner_id: UUID
    make: str
    model: str
    year: int | None
    license_plate: str
    color: str | None

    model_config = {"from_attributes": True}
