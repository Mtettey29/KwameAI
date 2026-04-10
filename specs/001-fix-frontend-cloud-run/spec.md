# Spec: Fix Frontend Cloud Run Dashboard Loading

## Problem
The deployed frontend loads a vendor dashboard using a hardcoded vendor identifier that does not exist in the seeded backend dataset. The result is a partially rendered UI with missing vendor data and empty metrics.

## Requirements
- The frontend must load a valid vendor even when a configured vendor id is missing.
- The backend base URL must be configurable at build time through Vite environment variables.
- The backend startup seed path must add missing canonical vendors to an existing database without duplicating prior records.
- The UI must show a clear error state when API calls fail.
- Currency values must render without mojibake.

## Acceptance Criteria
- When `VITE_VENDOR_ID` matches an existing vendor, the dashboard loads that vendor.
- When `VITE_VENDOR_ID` does not match an existing vendor, the dashboard falls back to the first vendor from `/vendors`.
- When the application starts against an existing database that has the original three seeded vendors, it adds Abeiku and his transactions without deleting or duplicating prior vendors.
- When the backend request fails, the page renders an explicit error state instead of a blank dashboard.
- The deployed frontend can be configured without editing source files.
