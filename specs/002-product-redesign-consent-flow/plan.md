# Plan: Reframe Beyond the Wallet Around Consent-Led Alternative Credit

## Design
- Replace the current single-screen dashboard with a staged product journey:
  1. product landing and value proposition
  2. phone number collection
  3. OTP approval verification
  4. approved trust insights workspace
- Introduce a minimal shadcn-style design system in the frontend using reusable UI primitives plus Tailwind-based layout tokens.
- Keep the backend prototype self-contained by storing consent requests in the app database.
- Model the approval flow as:
  - request created for a phone number
  - generated six-digit OTP code
  - verification window and approval status
  - resolved vendor mapping after approval
- Use deterministic mock behavior for the prototype:
  - known seeded MoMo numbers resolve to seeded vendors
  - the API returns a `demo_otp` for development so the UI can complete the flow without an SMS provider
- Add a consolidated onboarding endpoint set rather than overloading existing vendor endpoints.
- Keep the trust scoring engine intact and reuse it once consent is approved.

## Non-Goals
- Integrating a real SMS or telco approval provider.
- Building full Google ADK orchestration in this iteration.
- Implementing production-grade identity, encryption, or compliance workflows.

## Product Direction Notes
- Use the existing spec-driven flow as the execution guardrail.
- Shape the experience like an agent-led finance product: guided, stateful, and explicit about what data is being accessed and why.
- Keep the consent flow transparent so future telecom or MoMo provider integrations can replace the demo OTP path.

## Verification
- Backend can create and verify a consent request for a known seeded phone number.
- Frontend builds and renders the new journey without relying on the previous hardcoded vendor path.
- Approved consent reveals the trust workspace for the matched vendor.
- Unapproved users see the onboarding and verification states instead of the dashboard.
