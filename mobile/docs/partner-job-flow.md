# Partner job flow

## Single job screen

All entry points navigate to the same route: `/(partner)/job/[id]`.

| Entry | Action |
|-------|--------|
| **Home** → active job card | `router.push('/(partner)/job/{id}')` |
| **Schedule** → card tap or **Open job** / **Continue** CTA | Same route |
| **Offers** → accept offer | Same route after `POST /bookings/{id}/accept` |

There is no separate “schedule details” or duplicate job screen.

## In-screen lifecycle (footer CTA)

The job workspace is one scrollable screen (map, customer, briefing, uploads, checklist, timeline). The sticky footer drives washer-side phases via `useJobRealtime`:

1. Advances local phase (stored per booking in AsyncStorage).
2. When needed, `PATCH /bookings/{id}/status` with the coarse backend status from `washerJobPhase.js`.
3. Optimistic UI with rollback on API failure.

Phase labels come from `lib/jobPhases.js` (e.g. “Start heading to customer”, “I've arrived onsite”, “Start service”, …). When the job is **completed**, the primary CTA returns to the previous screen (`router.back()`).

### Phase → API status (web parity)

UI phases in `jobPhases.js` (`heading`, `service_started`, …) are mapped in `lib/washerJobPhase.js` before any `PATCH`:

| UI phase(s) | `PATCH` body `status` | When PATCH runs |
|-------------|----------------------|-----------------|
| `accepted`, `heading`, `arrived` | `confirmed` | Only if booking is not already `confirmed` |
| `service_started` and later wash steps | `in_progress` | When leaving `confirmed` for active wash |
| `completed` | `completed` | Final step |

**“Start heading to customer”** (`accepted` → `heading`) is **local-only** while the booking is already `confirmed` after accept — same as web. Never send `pending` from the washer app.

### Completing the job

After QC, the washer taps **Mark service completed** (`qc_complete` → `completed`):

1. `PATCH /bookings/{id}/status` → `completed`
2. `PATCH /bookings/{id}/milestone` → `service_phase=completed`
3. Customer sees **Service completed** on their timeline (no separate review step).

## Partner availability (account-wide)

Online / busy / offline is **global** for the partner account:

- UI: `AvailabilityCard` on **Home** only (not on Schedule).
- State: `PartnerStatusContext` + `GET/PATCH /partner/availability`.
- Affects whether the washer receives offers system-wide; it is not tied to the selected schedule date.

## Customer details (web parity)

- All customer/job fields come from **`GET /bookings/{id}`** (`customer_name`, `customer_phone`, `car_label`, `notes`, address coords).
- Tapping the customer header opens **`CustomerJobDetailSheet`** — no second API, no `/users/...` calls.
- Live map uses **`GET /bookings/{id}/tracking`** (poll). Failures show a soft banner; the rest of the job screen still works.

## Defensive data

Backend fields such as `customer.rating`, `completedWashes`, tracking `distance_km`, and `eta_minutes` may be null. UI formatters live in `lib/partnerFormatters.js` (`formatOptionalNumber`, `formatCustomerTrustLine`, etc.) so partial API payloads never crash the job screen.

Failed detail loads show **`JobLoadError`** with retry (same contract as web `WasherJobPage` error state).
