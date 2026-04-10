# Spec: Statement Upload Sync For The Web App

## Goal
Allow signed-in users to upload Mobile Money statements in the web app, convert those statements into a normalized transaction ledger, and refresh their workspace with newer statement uploads over time.

## Requirements
- Firebase-authenticated users can upload a statement file from the dashboard.
- The upload flow works in the web app on desktop and mobile browsers.
- The backend accepts statement uploads without requiring native-device SMS access.
- Uploaded transactions are merged into the existing vendor ledger rather than replacing it blindly.
- The workspace shows sync freshness and nudges the user to upload a newer statement when the data is stale.
- The upload flow supports incremental refresh by tracking the latest synced transaction date.

## Non-Goals
- Native Android or iPhone SMS ingestion.
- Direct telco transaction-history APIs.
- Fully exhaustive parsing for every carrier statement format on day one.

## Acceptance Criteria
- A user can upload a statement file and receive an updated workspace from the backend.
- The backend stores upload metadata and deduplicates repeated transaction imports.
- The UI exposes the latest sync timestamp and a refresh-oriented call to action.
- Automated tests cover at least one successful statement import path.
