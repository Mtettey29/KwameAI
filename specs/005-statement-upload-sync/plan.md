# Plan: Statement Upload Sync For The Web App

## Product Shape
- Keep Firebase phone auth as the identity layer.
- Keep the current consent/workspace shell.
- Add statement upload as the web-safe data-ingestion path.
- Treat future uploads as refreshes that extend the ledger.

## Backend Design
- Add a `StatementUpload` model for provider, phone number, filename, status, imported count, and synced range.
- Add a protected upload endpoint that accepts base64-encoded file payloads from the frontend.
- Parse CSV, text, and PDF files into normalized transactions.
- Reuse the existing transaction table for scoring so uploaded data immediately feeds the trust workspace.
- Deduplicate imports by matching vendor, amount, timestamp, type, and description.

## Frontend Design
- Add a statement-sync panel in the dashboard.
- Show upload state, last sync timestamp, latest covered date, and refresh guidance.
- Allow the user to choose a provider and file, then upload and rehydrate the workspace.

## Verification
- Add a backend test for a successful upload/import flow.
- Run backend tests and frontend build.
- Redeploy frontend and backend after verification passes.
