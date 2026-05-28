from uuid import UUID

from pydantic import BaseModel, Field


class AdminPartnerPayoutRow(BaseModel):
    washer_id: UUID
    partner_name: str
    jobs: int = 0
    gross_cents: int = 0
    partner_cents: int = 0
    pending_cents: int = 0
    paid_cents: int = 0


class AdminEarningsOverview(BaseModel):
    share_percent: int = Field(default=90, description="Partner share of each accepted job")
    customer_paid_30d_cents: int = Field(description="Completed booking totals (last 30 days)")
    customer_paid_lifetime_cents: int = Field(description="All completed booking totals")
    gross_accepted_30d_cents: int = Field(description="Gross on accepted jobs (earnings ledger, 30d)")
    gross_accepted_lifetime_cents: int = Field(description="Gross on accepted jobs (earnings ledger, lifetime)")
    partner_payouts_30d_cents: int = Field(description="Partner share earned in last 30 days")
    partner_payouts_lifetime_cents: int = Field(description="Partner share earned lifetime")
    platform_fees_30d_cents: int = Field(description="Admin share (30d accepted gross − partner)")
    platform_fees_lifetime_cents: int = Field(description="Admin share lifetime")
    pending_settlement_cents: int = Field(description="Partner share not yet marked paid")
    paid_out_cents: int = Field(description="Partner share marked paid")
    partners: list[AdminPartnerPayoutRow] = Field(default_factory=list)
