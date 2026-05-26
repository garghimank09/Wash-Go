from pydantic import BaseModel


class GeocodeRead(BaseModel):
    lat: float
    lng: float
    found: bool = True
    approximate: bool = False


class ReverseGeocodeRead(BaseModel):
    address: str
    lat: float
    lng: float
