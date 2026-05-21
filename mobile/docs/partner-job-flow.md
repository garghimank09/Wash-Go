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

## Partner availability (account-wide)

Online / busy / offline is **global** for the partner account:

- UI: `AvailabilityCard` on **Home** only (not on Schedule).
- State: `PartnerStatusContext` + `GET/PATCH /partner/availability`.
- Affects whether the washer receives offers system-wide; it is not tied to the selected schedule date.

## Defensive data

Backend fields such as `customer.rating`, `completedWashes`, tracking `distance_km`, and `eta_minutes` may be null. UI formatters live in `lib/partnerFormatters.js` (`formatOptionalNumber`, `formatCustomerTrustLine`, etc.) so partial API payloads never crash the job screen.
