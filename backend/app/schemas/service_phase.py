"""Customer-visible service milestones (persisted on bookings)."""

from typing import Final

SERVICE_PHASE_ORDER: Final[tuple[str, ...]] = (
    "payment_received",
    "awaiting_acceptance",
    "washer_accepted",
    "heading_to_you",
    "arrived_onsite",
    "awaiting_arrival_approval",
    "arrival_approved",
    "wash_in_progress",
    "completed",
    "cancelled",
)

VALID_SERVICE_PHASES: Final[frozenset[str]] = frozenset(SERVICE_PHASE_ORDER)

MILESTONE_NOTIFY: Final[dict[str, tuple[str, str]]] = {
    "awaiting_acceptance": ("Booking confirmed", "Payment received — we are matching a washer near you."),
    "washer_accepted": ("Washer accepted", "Your washer confirmed the job and will head out soon."),
    "heading_to_you": ("Washer on the way", "Track live progress on your booking detail."),
    "arrived_onsite": ("Washer arrived", "Your washer checked in at the service location."),
    "awaiting_arrival_approval": (
        "Review vehicle condition",
        "Your washer documented the vehicle — open your booking to review and approve before the wash.",
    ),
    "arrival_approved": (
        "Vehicle condition approved",
        "Thanks — your washer can accept the vehicle and begin the wash.",
    ),
    "wash_in_progress": ("Wash started", "Your vehicle is being cleaned now."),
    "completed": ("Wash complete", "Thanks for using WashGo — your service is done."),
}


def phase_rank(phase: str | None) -> int:
    if not phase or phase not in SERVICE_PHASE_ORDER:
        return -1
    return SERVICE_PHASE_ORDER.index(phase)
