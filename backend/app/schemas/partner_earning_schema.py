from pydantic import BaseModel, Field


class PartnerEarningsDayPoint(BaseModel):
    day: str
    cents: int
    jobs: int


class PartnerEarningsSummary(BaseModel):
    share_percent: int = Field(default=90, description="Partner share of each wash (admin retains the rest)")
    week_partner_cents: int
    lifetime_partner_cents: int
    pending_weekly_cents: int
    week_jobs: int
    lifetime_jobs: int
    series: list[PartnerEarningsDayPoint]
