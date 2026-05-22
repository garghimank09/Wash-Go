from pydantic import BaseModel, Field


class PlaceSuggestion(BaseModel):
    place_id: str
    description: str


class PlaceAutocompleteResponse(BaseModel):
    suggestions: list[PlaceSuggestion] = Field(default_factory=list)
