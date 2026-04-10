# Plan: Fix Frontend Cloud Run Dashboard Loading

## Design
- Replace the hardcoded API base and vendor id in `frontend/src/App.tsx` with Vite environment variables plus safe defaults.
- Fetch `/vendors` first, then select the configured vendor by id or name, with fallback to the first available vendor.
- Use a shared fetch helper that throws on non-2xx responses so the UI can render a deterministic error state.
- Make the backend seeding idempotent at the vendor level so Cloud SQL deployments can backfill missing vendors on startup.
- Format GHS values with `Intl.NumberFormat` instead of embedding a fragile currency symbol string.

## Non-Goals
- Reworking the backend API shape.
- Adding a full Spec Kit CLI bootstrap to the repo.

## Verification
- Confirm the deployed backend currently exposes vendor ids `1`, `2`, and `3`.
- Confirm the updated seed path adds Abeiku to both a fresh database and an existing three-vendor database.
- Build the frontend locally.
- Run the existing backend scoring test.
